export function getDeletedMessageLink(
  groupId: number,
  topicThreadId: number,
  messageId: number,
) {
  return `https://t.me/c/${groupId.toString().slice(4)}/${topicThreadId}/${messageId}`;
}
