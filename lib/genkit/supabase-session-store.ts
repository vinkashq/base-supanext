import type {
  SessionSnapshot,
  SessionStore,
  SessionStoreOptions,
  SnapshotMutator,
} from 'genkit/beta'
import { SupabaseClient } from '@supabase/supabase-js'

type SnapshotLookup = {
  snapshotId?: string
  sessionId?: string
  context?: SessionStoreOptions['context']
}

class SupabaseSessionStore<S> implements SessionStore<S> {
  private supabaseClient: SupabaseClient

  constructor(client: SupabaseClient) {
    this.supabaseClient = client
  }

  async getUserId() {
    const response = await this.supabaseClient.auth.getUser()
    if (response.error) {
      throw response.error
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
    const userId = await this.getUserId()
    const { data, error } = await this.supabaseClient
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', opts.sessionId)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async saveSnapshot(
    snapshotId: string | undefined,
    mutator: SnapshotMutator<S>,
    options?: SessionStoreOptions,
  ): Promise<string | null> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabaseClient
      .from('sessions')
      .upsert({
        user_id: userId,
        session_id: options?.sessionId,
        context: options?.context,
      })
    if (error) {
      throw error
    }

    return data
  }

  onSnapshotStateChange(
    snapshotId: string,
    callback: (snapshot: SessionSnapshot<S>) => void,
    options?: SessionStoreOptions,
  ): void | (() => void) {
    return () => { }
  }
}
