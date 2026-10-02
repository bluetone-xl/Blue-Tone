export function resolveManagementTarget(context, selection) {
  return context?.groupId || null;
}

export default { resolveManagementTarget };
