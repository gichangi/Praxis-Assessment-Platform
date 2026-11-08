/**
 * Works out how to turn a person's memberships (one row per location, all with the same role)
 * into the set the admin asked for. Pure, so it can be tested without a database.
 */

export type MembershipRow = { id: string; location_id: string | null }

export type MembershipPlan = {
  /** Locations to create memberships for (null = every location), with the new role. */
  insert: (string | null)[]
  /** Existing membership rows to remove. */
  deleteIds: string[]
  /** Create before deleting, so a failure part-way never leaves the person without access. */
  insertFirst: boolean
}

const key = (l: string | null) => l ?? 'null'

/**
 * @param desired locations the person should end up with (null entry = all locations);
 *                undefined = leave their locations as they are.
 */
export function planMembershipChange(input: {
  current: MembershipRow[]
  oldRole: string
  newRole: string
  desired: (string | null)[] | undefined
}): MembershipPlan {
  const { current, oldRole, newRole, desired } = input
  const target = [...new Map((desired ?? current.map((c) => c.location_id)).map((l) => [key(l), l])).values()]

  if (newRole !== oldRole) {
    // A different role is a different membership: create the new ones, then drop the old ones.
    return { insert: target, deleteIds: current.map((c) => c.id), insertFirst: true }
  }

  const wanted = new Set(target.map(key))
  const have = new Set(current.map((c) => key(c.location_id)))
  return {
    insert: target.filter((l) => !have.has(key(l))),
    deleteIds: current.filter((c) => !wanted.has(key(c.location_id))).map((c) => c.id),
    insertFirst: true,
  }
}
