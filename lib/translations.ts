export type Language = 'zh' | 'en' | 'ja' | 'th';

export const translations = {
  zh: {
    common: {
      logout: "退出登录",
      cancel: "取消",
      post: "发布",
      confirm: "确定"
    },
    home: {
      title: "家庭日记",
      introTitle: "记录我们的点点滴滴",
      introText: "这是一个私密的家庭空间，用于分享和保存我们的珍贵回忆。请登录或申请加入。",
      login: "登录",
      register: "申请加入",
      back: "返回",
      dbHint: "提示：新注册用户需要等待管理员批准。"
    },
    auth: {
      selectRole: "请选择操作",
      roleMember: "家庭成员登录",
      roleAdmin: "管理员登录",
      username: "用户名",
      usernameHint: "3-20 个字符",
      password: "密码",
      name: "姓名/昵称",
      login: "登录",
      register: "提交申请",
      back: "返回",
      success: "成功",
      failed: "失败",
      pending: "账号审核中，请联系管理员。",
      rejected: "账号申请已被拒绝。",
      logout: "退出登录"
    },
    diary: {
      title: "日记列表",
      newEntry: "写日记",
      createTitle: "写新日记",
      noEntries: "还没有日记，快来写第一篇吧！",
      contentPlaceholder: "今天发生了什么有趣的事？",
      placeholder: "分享你的故事...",
      mediaUrl: "照片/视频链接",
      addMedia: "添加媒体链接",
      publish: "发布",
      comment: "评论",
      commentPlaceholder: "写下你的评论...",
      submitComment: "发送",
      loadMore: "加载更多"
    },
    admin: {
      title: "管理员后台",
      dashboard: "管理员后台",
      pendingUsers: "待审核用户",
      pendingRequests: "待审核用户",
      noPending: "暂无待审核用户",
      approve: "批准",
      reject: "拒绝",
      approved: "已批准",
      rejected: "已拒绝",
      confirmReject: "确定要拒绝该用户吗？"
    }
  },
  en: {
    common: {
      logout: "Logout",
      cancel: "Cancel",
      post: "Post",
      confirm: "Confirm"
    },
    home: {
      title: "Family Diary",
      introTitle: "Our Precious Moments",
      introText: "A private space to share and keep our memories. Please login or request to join.",
      login: "Login",
      register: "Request Access",
      back: "Back",
      dbHint: "Note: New accounts require admin approval."
    },
    auth: {
      selectRole: "Select Action",
      roleMember: "Member Login",
      roleAdmin: "Admin Login",
      username: "Username",
      usernameHint: "3-20 characters",
      password: "Password",
      name: "Name/Nickname",
      login: "Login",
      register: "Submit Request",
      back: "Back",
      success: "Success",
      failed: "Failed",
      pending: "Account pending approval.",
      rejected: "Account request rejected.",
      logout: "Logout"
    },
    diary: {
      title: "Diary Feed",
      newEntry: "New Entry",
      createTitle: "New Diary Entry",
      noEntries: "No entries yet. Be the first to post!",
      contentPlaceholder: "What happened today?",
      placeholder: "Share your story...",
      mediaUrl: "Photo/Video URL",
      addMedia: "Add Media URL",
      publish: "Publish",
      comment: "Comment",
      commentPlaceholder: "Write a comment...",
      submitComment: "Post",
      loadMore: "Load More"
    },
    admin: {
      title: "Admin Dashboard",
      dashboard: "Admin Dashboard",
      pendingUsers: "Pending Users",
      pendingRequests: "Pending Requests",
      noPending: "No pending users",
      approve: "Approve",
      reject: "Reject",
      approved: "Approved",
      rejected: "Rejected",
      confirmReject: "Are you sure you want to reject this user?"
    }
  },
  ja: {
    common: {
      logout: "ログアウト",
      cancel: "キャンセル",
      post: "投稿",
      confirm: "確認"
    },
    home: {
      title: "ファミリー日記",
      introTitle: "私たちの思い出",
      introText: "大切な思い出を共有し保存するためのプライベートスペースです。ログインまたは参加申請してください。",
      login: "ログイン",
      register: "参加申請",
      back: "戻る",
      dbHint: "注：新規アカウントは管理者の承認が必要です。"
    },
    auth: {
      selectRole: "操作を選択",
      roleMember: "メンバーログイン",
      roleAdmin: "管理者ログイン",
      username: "ユーザー名",
      usernameHint: "3-20文字",
      password: "パスワード",
      name: "名前/ニックネーム",
      login: "ログイン",
      register: "申請を送信",
      back: "戻る",
      success: "成功",
      failed: "失敗",
      pending: "アカウント審査中。",
      rejected: "申請が拒否されました。",
      logout: "ログアウト"
    },
    diary: {
      title: "日記一覧",
      newEntry: "日記を書く",
      createTitle: "新しい日記",
      noEntries: "まだ日記がありません。最初の投稿を書きましょう！",
      contentPlaceholder: "今日はどんなことがありましたか？",
      placeholder: "あなたの物語を共有しましょう...",
      mediaUrl: "写真/動画 URL",
      addMedia: "メディアURLを追加",
      publish: "公開",
      comment: "コメント",
      commentPlaceholder: "コメントを書く...",
      submitComment: "送信",
      loadMore: "もっと見る"
    },
    admin: {
      title: "管理者ダッシュボード",
      dashboard: "管理者ダッシュボード",
      pendingUsers: "承認待ちユーザー",
      pendingRequests: "承認待ちリクエスト",
      noPending: "承認待ちユーザーはいません",
      approve: "承認",
      reject: "拒否",
      approved: "承認済み",
      rejected: "拒否済み",
      confirmReject: "このユーザーを拒否してもよろしいですか？"
    }
  },
  th: {
    common: {
      logout: "ออกจากระบบ",
      cancel: "ยกเลิก",
      post: "โพสต์",
      confirm: "ยืนยัน"
    },
    home: {
      title: "ไดอารี่ครอบครัว",
      introTitle: "ความทรงจำของเรา",
      introText: "พื้นที่ส่วนตัวสำหรับแบ่งปันและเก็บรักษาความทรงจำ กรุณาเข้าสู่ระบบหรือขอเข้าร่วม",
      login: "เข้าสู่ระบบ",
      register: "ขอเข้าร่วม",
      back: "กลับ",
      dbHint: "หมายเหตุ: บัญชีใหม่ต้องรอการอนุมัติจากผู้ดูแลระบบ"
    },
    auth: {
      selectRole: "เลือกการดำเนินการ",
      roleMember: "สมาชิกเข้าสู่ระบบ",
      roleAdmin: "ผู้ดูแลระบบเข้าสู่ระบบ",
      username: "ชื่อผู้ใช้",
      usernameHint: "3-20 ตัวอักษร",
      password: "รหัสผ่าน",
      name: "ชื่อ/ชื่อเล่น",
      login: "เข้าสู่ระบบ",
      register: "ส่งคำขอ",
      back: "กลับ",
      success: "สำเร็จ",
      failed: "ล้มเหลว",
      pending: "รอการอนุมัติบัญชี",
      rejected: "คำขอถูกปฏิเสธ",
      logout: "ออกจากระบบ"
    },
    diary: {
      title: "รายการไดอารี่",
      newEntry: "เขียนไดอารี่",
      createTitle: "ไดอารี่ใหม่",
      noEntries: "ยังไม่มีไดอารี่ มาเริ่มเขียนกันเถอะ!",
      contentPlaceholder: "วันนี้มีอะไรเกิดขึ้นบ้าง?",
      placeholder: "แบ่งปันเรื่องราวของคุณ...",
      mediaUrl: "ลิงก์รูปภาพ/วิดีโอ",
      addMedia: "เพิ่มลิงก์สื่อ",
      publish: "โพสต์",
      comment: "ความคิดเห็น",
      commentPlaceholder: "เขียนความคิดเห็น...",
      submitComment: "ส่ง",
      loadMore: "โหลดเพิ่มเติม"
    },
    admin: {
      title: "แดชบอร์ดผู้ดูแลระบบ",
      dashboard: "แดชบอร์ดผู้ดูแลระบบ",
      pendingUsers: "ผู้ใช้รอการอนุมัติ",
      pendingRequests: "คำขอที่รอดำเนินการ",
      noPending: "ไม่มีผู้ใช้รอการอนุมัติ",
      approve: "อนุมัติ",
      reject: "ปฏิเสธ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธแล้ว",
      confirmReject: "คุณแน่ใจหรือไม่ที่จะปฏิเสธผู้ใช้นี้?"
    }
  }
};
