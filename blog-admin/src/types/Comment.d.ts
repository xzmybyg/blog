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
