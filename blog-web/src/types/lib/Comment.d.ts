// export type Comment = {
//   id: number;
//   text: string;
// };
export type Barrage = {
  comment: Comment
  top: number
  delay: number
}
export type Comment = {
  user_id: number
  username: string
  nickname: string
  avatar: string

  comment_id: number
  content: string
  create_time: string
  like_count: number

  replyList: Reply[]
}

export type Reply = {
  user_id: number
  username: string
  nickname: string
  avatar: string

  reply_id: number
  content: string
  create_time: string
  like_count: number
  reply_to_user_id: number
  username: string
  create_time: string
  like_count: number
}
