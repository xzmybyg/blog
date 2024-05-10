declare type TheComment = {
  user_id: number;
  username: string;
  nickname: string;
  avatar: string;

  comment_id: number;
  content: string;
  create_time: string;
  like_count: number;

  replyList: Reply[];
};

declare type Barrage = {
  comment: TheComment;
  top: number;
  delay: number;
};

declare type Reply = {
  user_id: number;
  username: string;
  nickname: string;
  avatar: string;

  reply_id: number;
  content: string;
  create_time: string;
  like_count: number;
  reply_to_user_id: number;
  username: string;
  create_time: string;
  like_count: number;
};

declare type CommentAdmin = {
  article_id: number;
  avatar: string;
  comment_id: number;
  comment_to_article_id: number;
  comment_to_article_title: string;
  content: string;
  createTime: Date;
  like: number;
  nickname: string;
  replyList: {
    avatar: string;
    content: string;
    createTime: Date;
    nickname: string;
    reply_id: number;
    reply_to_nickname: string;
    reply_to_username: string;
    reply_to_user_id: number;
    username: string;
    user_id: number;
    username: string;
    user_id: number;
  }[];
};
