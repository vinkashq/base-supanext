import type {
  SessionSnapshot,
  SessionStore,
  SessionStoreOptions,
  SnapshotMutator,
} from 'genkit/beta'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../supabase/server'

type SnapshotLookup = {
  snapshotId?: string
  sessionId?: string
  context?: SessionStoreOptions['context']
}

export default class SupabaseSessionStore<S> implements SessionStore<S> {
  private schema: string
  private _supabase: SupabaseClient<any, "public", string, any, any> | null = null

  constructor(schema: string = "genkit") {
    this.schema = schema
  }

  async getSupabase() {
    if (!this._supabase) {
      this._supabase = await createClient(this.schema)
    }
    return this._supabase
  }

  async getUserId() {
    const supabase = await this.getSupabase()
    const response = await supabase.auth.getUser()
    if (response.error) {
      throw new Error(response.error.message)
    }

    const user = response.data.user
    if (!user) {
      throw new Error("User is not logged in")
    }

    return user.id
  }

  async getSnapshot(
    opts: SnapshotLookup,
  ): Promise<SessionSnapshot<S> | undefined> {
    const userId = opts.context?.auth?.uid || await this.getUserId()
    const supabase = await this.getSupabase()
    let query = supabase
      .from('snapshots')
      .select('data')
      .eq('session.user_id', userId)

    if (opts.snapshotId) {
      query = query.eq('id', opts.snapshotId)
    } else if (opts.sessionId) {
      query = query
        .eq('session_id', opts.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
    } else {
      throw new Error('Must provide either snapshotId or sessionId')
    }

    const { data, error } = await query.single()

    if (error || !data) return undefined

    return data.data as SessionSnapshot<S>
  }

  async saveSnapshot(
    snapshotId: string | undefined,
    mutator: SnapshotMutator<S>,
    options?: SessionStoreOptions,
  ): Promise<string | null> {
    let currentSnapshot: SessionSnapshot<S> | undefined = undefined
    if (snapshotId) {
      currentSnapshot = await this.getSnapshot({ snapshotId, context: options?.context })
    }

    const nextSnapshot = await mutator(currentSnapshot)
    if (!nextSnapshot) return null

    const idToSave = snapshotId ?? nextSnapshot.snapshotId ?? crypto.randomUUID()
    const finalSnapshot = { ...nextSnapshot, id: idToSave }

    const userId = options?.context?.auth?.uid || await this.getUserId()
    const supabase = await this.getSupabase()
    const { error: sessionError } = await supabase.from('sessions').upsert({
      id: finalSnapshot.sessionId,
      user_id: userId
    })

    if (sessionError) {
      throw new Error(`Failed to create/update session: ${sessionError.message}`)
    }

    const { error: snapshotError } = await supabase.from('snapshots').upsert({
      id: idToSave,
      session_id: finalSnapshot.sessionId,
      data: finalSnapshot,
    })

    if (snapshotError) {
      throw new Error(`Failed to save snapshot: ${snapshotError.message}`)
    }

    return idToSave
  }

  onSnapshotStateChange(
    snapshotId: string,
    callback: (snapshot: SessionSnapshot<S>) => void,
    options?: SessionStoreOptions,
  ): void | (() => void) {
    const supabase = this._supabase
    if (!supabase) {
      throw new Error('Supabase is not initialized. Make sure to call getSupabase() before using this method.')
    }

    const channel = supabase
      .channel(`genkit_snapshot_${snapshotId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'snapshots',
          filter: `id=eq.${snapshotId}`,
        },
        (payload) => {
          const newData = payload.new as { data?: any } | null
          if (newData && newData.data) {
            callback(newData.data as SessionSnapshot<S>)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}