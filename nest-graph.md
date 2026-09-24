# NestJS architecture

## 1. Modules

```mermaid
graph LR
  AppModule["📦 AppModule"]
  AppModule -->|imports| UserAccountsModule
  AppModule -->|imports| BloggersPlatformModule
  AppModule -->|imports| TestingModule
  AppModule -->|imports| CoreModule
  UserAccountsModule["📦 UserAccountsModule"]
  UserAccountsModule -->|imports| NotificationsModule
  UserAccountsModule -->|imports| CoreModule
  NotificationsModule["📦 NotificationsModule"]
  NotificationsModule -->|imports| CoreModule
  BloggersPlatformModule["📦 BloggersPlatformModule"]
  BloggersPlatformModule -->|imports| UserAccountsModule
  BloggersPlatformModule -->|imports| CoreModule
  TestingModule["📦 TestingModule"]
  TestingModule -->|imports| CoreModule
  CoreModule["📦 CoreModule"]
```

## 2. Controllers and providers

```mermaid
graph LR
  AppModule["📦 AppModule"]
  AppModule_AppController["🎮 AppController"]
  AppModule --> AppModule_AppController
  AppModule_AppService["⚙️ AppService"]
  AppModule --> AppModule_AppService
  AppModule_APP_FILTER__UUID__1cddf712b0ffded65619c_["⚙️ APP_FILTER (UUID: 1cddf712b0ffded65619c)"]
  AppModule --> AppModule_APP_FILTER__UUID__1cddf712b0ffded65619c_
  AppModule_APP_FILTER__UUID__ddf712b0ffded65619c4f_["⚙️ APP_FILTER (UUID: ddf712b0ffded65619c4f)"]
  AppModule --> AppModule_APP_FILTER__UUID__ddf712b0ffded65619c4f_
  UserAccountsModule["📦 UserAccountsModule"]
  UserAccountsModule_UsersController["🎮 UsersController"]
  UserAccountsModule --> UserAccountsModule_UsersController
  UserAccountsModule_AuthController["🎮 AuthController"]
  UserAccountsModule --> UserAccountsModule_AuthController
  UserAccountsModule_SecurityDevicesController["🎮 SecurityDevicesController"]
  UserAccountsModule --> UserAccountsModule_SecurityDevicesController
  UserAccountsModule_AuthService["⚙️ AuthService"]
  UserAccountsModule --> UserAccountsModule_AuthService
  UserAccountsModule_AuthQueryRepository["🔎 AuthQueryRepository"]
  UserAccountsModule --> UserAccountsModule_AuthQueryRepository
  UserAccountsModule_UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  UserAccountsModule --> UserAccountsModule_UsersExternalQueryRepository
  UserAccountsModule_UsersQueryRepository["🔎 UsersQueryRepository"]
  UserAccountsModule --> UserAccountsModule_UsersQueryRepository
  UserAccountsModule_UsersRepository["🗄️ UsersRepository"]
  UserAccountsModule --> UserAccountsModule_UsersRepository
  UserAccountsModule_SessionRepository["🗄️ SessionRepository"]
  UserAccountsModule --> UserAccountsModule_SessionRepository
  UserAccountsModule_SessionsQueryRepository["🔎 SessionsQueryRepository"]
  UserAccountsModule --> UserAccountsModule_SessionsQueryRepository
  UserAccountsModule_PasswordService["⚙️ PasswordService"]
  UserAccountsModule --> UserAccountsModule_PasswordService
  UserAccountsModule_CreateUserUseCase["🧩 CreateUserUseCase"]
  UserAccountsModule --> UserAccountsModule_CreateUserUseCase
  UserAccountsModule_DeleteUserUseCase["🧩 DeleteUserUseCase"]
  UserAccountsModule --> UserAccountsModule_DeleteUserUseCase
  UserAccountsModule_LoginUserUseCase["🧩 LoginUserUseCase"]
  UserAccountsModule --> UserAccountsModule_LoginUserUseCase
  UserAccountsModule_RegisterUserUseCase["🧩 RegisterUserUseCase"]
  UserAccountsModule --> UserAccountsModule_RegisterUserUseCase
  UserAccountsModule_ConfirmCodeUseCase["🧩 ConfirmCodeUseCase"]
  UserAccountsModule --> UserAccountsModule_ConfirmCodeUseCase
  UserAccountsModule_RegisterEmailResendingUseCase["🧩 RegisterEmailResendingUseCase"]
  UserAccountsModule --> UserAccountsModule_RegisterEmailResendingUseCase
  UserAccountsModule_NewPasswordRecoveryUseCase["🧩 NewPasswordRecoveryUseCase"]
  UserAccountsModule --> UserAccountsModule_NewPasswordRecoveryUseCase
  UserAccountsModule_PasswordRecoveryUseCase["🧩 PasswordRecoveryUseCase"]
  UserAccountsModule --> UserAccountsModule_PasswordRecoveryUseCase
  UserAccountsModule_RefreshTokenUseCase["🧩 RefreshTokenUseCase"]
  UserAccountsModule --> UserAccountsModule_RefreshTokenUseCase
  UserAccountsModule_LogoutUserUseCase["🧩 LogoutUserUseCase"]
  UserAccountsModule --> UserAccountsModule_LogoutUserUseCase
  UserAccountsModule_DeleteAllDevicesSessionsUseCase["🧩 DeleteAllDevicesSessionsUseCase"]
  UserAccountsModule --> UserAccountsModule_DeleteAllDevicesSessionsUseCase
  UserAccountsModule_DeleteDeviceSessionUseCase["🧩 DeleteDeviceSessionUseCase"]
  UserAccountsModule --> UserAccountsModule_DeleteDeviceSessionUseCase
  UserAccountsModule_LocalStrategy["🔐 LocalStrategy"]
  UserAccountsModule --> UserAccountsModule_LocalStrategy
  UserAccountsModule_JwtStrategy["🔐 JwtStrategy"]
  UserAccountsModule --> UserAccountsModule_JwtStrategy
  UserAccountsModule_JwtAdapter["⚙️ JwtAdapter"]
  UserAccountsModule --> UserAccountsModule_JwtAdapter
  UserAccountsModule_RefreshTokenStrategy["🔐 RefreshTokenStrategy"]
  UserAccountsModule --> UserAccountsModule_RefreshTokenStrategy
  UserAccountsModule_UserAccountsConfig["⚙️ UserAccountsConfig"]
  UserAccountsModule --> UserAccountsModule_UserAccountsConfig
  NotificationsModule["📦 NotificationsModule"]
  NotificationsModule_EmailService["⚙️ EmailService"]
  NotificationsModule --> NotificationsModule_EmailService
  NotificationsModule_EmailTemplateManager["⚙️ EmailTemplateManager"]
  NotificationsModule --> NotificationsModule_EmailTemplateManager
  BloggersPlatformModule["📦 BloggersPlatformModule"]
  BloggersPlatformModule_BlogsController["🎮 BlogsController"]
  BloggersPlatformModule --> BloggersPlatformModule_BlogsController
  BloggersPlatformModule_PostsController["🎮 PostsController"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsController
  BloggersPlatformModule_CommentsController["🎮 CommentsController"]
  BloggersPlatformModule --> BloggersPlatformModule_CommentsController
  BloggersPlatformModule_BlogsRepository["🗄️ BlogsRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_BlogsRepository
  BloggersPlatformModule_BlogsQueryRepository["🔎 BlogsQueryRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_BlogsQueryRepository
  BloggersPlatformModule_PostsRepository["🗄️ PostsRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsRepository
  BloggersPlatformModule_PostsQueryRepository["🔎 PostsQueryRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsQueryRepository
  BloggersPlatformModule_PostLikesRepository["🗄️ PostLikesRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_PostLikesRepository
  BloggersPlatformModule_CommentsQueryRepository["🔎 CommentsQueryRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_CommentsQueryRepository
  BloggersPlatformModule_CommentsRepository["🗄️ CommentsRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_CommentsRepository
  BloggersPlatformModule_CommentLikesRepository["🗄️ CommentLikesRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_CommentLikesRepository
  BloggersPlatformModule_CreateBlogUseCase["🧩 CreateBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreateBlogUseCase
  BloggersPlatformModule_UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdateBlogUseCase
  BloggersPlatformModule_DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_DeleteBlogUseCase
  BloggersPlatformModule_CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreatePostForBlogUseCase
  BloggersPlatformModule_CreatePostUseCase["🧩 CreatePostUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreatePostUseCase
  BloggersPlatformModule_UpdatePostUseCase["🧩 UpdatePostUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdatePostUseCase
  BloggersPlatformModule_DeletePostUseCase["🧩 DeletePostUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_DeletePostUseCase
  BloggersPlatformModule_CreateCommentForPostUseCase["🧩 CreateCommentForPostUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreateCommentForPostUseCase
  BloggersPlatformModule_UpdateCommentUseCase["🧩 UpdateCommentUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdateCommentUseCase
  BloggersPlatformModule_DeleteCommentUseCase["🧩 DeleteCommentUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_DeleteCommentUseCase
  BloggersPlatformModule_UpdateLikeStatusUseCase["🧩 UpdateLikeStatusUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdateLikeStatusUseCase
  BloggersPlatformModule_UpdatePostLikeStatusUseCase["🧩 UpdatePostLikeStatusUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdatePostLikeStatusUseCase
  TestingModule["📦 TestingModule"]
  TestingModule_TestingController["🎮 TestingController"]
  TestingModule --> TestingModule_TestingController
  CoreModule["📦 CoreModule"]
  CoreModule_CoreConfig["⚙️ CoreConfig"]
  CoreModule --> CoreModule_CoreConfig
```

## 3. Dependency Injection

### AppModule

```mermaid
graph LR
  AppController["🎮 AppController"]
  AppService["⚙️ AppService"]
  APP_FILTER["⚙️ APP_FILTER"]
  CoreConfig["⚙️ CoreConfig"]
  AppController -->|injects| AppService
  APP_FILTER -->|injects| CoreConfig
```

### UserAccountsModule

```mermaid
graph LR
  UsersController["🎮 UsersController"]
  CommandBus["🚌 CommandBus"]
  UsersQueryRepository["🔎 UsersQueryRepository"]
  AuthController["🎮 AuthController"]
  AuthQueryRepository["🔎 AuthQueryRepository"]
  SecurityDevicesController["🎮 SecurityDevicesController"]
  SessionsQueryRepository["🔎 SessionsQueryRepository"]
  AuthService["⚙️ AuthService"]
  UsersRepository["🗄️ UsersRepository"]
  PasswordService["⚙️ PasswordService"]
  UserModel["⚙️ UserModel"]
  UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  SessionRepository["🗄️ SessionRepository"]
  SessionEntityModel["⚙️ SessionEntityModel"]
  CreateUserUseCase["🧩 CreateUserUseCase"]
  DeleteUserUseCase["🧩 DeleteUserUseCase"]
  LoginUserUseCase["🧩 LoginUserUseCase"]
  JwtAdapter["⚙️ JwtAdapter"]
  RegisterUserUseCase["🧩 RegisterUserUseCase"]
  EmailService["⚙️ EmailService"]
  ConfirmCodeUseCase["🧩 ConfirmCodeUseCase"]
  RegisterEmailResendingUseCase["🧩 RegisterEmailResendingUseCase"]
  NewPasswordRecoveryUseCase["🧩 NewPasswordRecoveryUseCase"]
  PasswordRecoveryUseCase["🧩 PasswordRecoveryUseCase"]
  RefreshTokenUseCase["🧩 RefreshTokenUseCase"]
  LogoutUserUseCase["🧩 LogoutUserUseCase"]
  DeleteAllDevicesSessionsUseCase["🧩 DeleteAllDevicesSessionsUseCase"]
  DeleteDeviceSessionUseCase["🧩 DeleteDeviceSessionUseCase"]
  LocalStrategy["🔐 LocalStrategy"]
  JwtStrategy["🔐 JwtStrategy"]
  UserAccountsConfig["⚙️ UserAccountsConfig"]
  JwtService["⚙️ JwtService"]
  RefreshTokenStrategy["🔐 RefreshTokenStrategy"]
  ConfigService["⚙️ ConfigService"]
  UsersController -->|injects| CommandBus
  UsersController -->|injects| UsersQueryRepository
  AuthController -->|injects| AuthQueryRepository
  AuthController -->|injects| CommandBus
  SecurityDevicesController -->|injects| CommandBus
  SecurityDevicesController -->|injects| SessionsQueryRepository
  AuthService -->|injects| UsersRepository
  AuthService -->|injects| PasswordService
  AuthQueryRepository -->|injects| UserModel
  UsersExternalQueryRepository -->|injects| UserModel
  UsersQueryRepository -->|injects| UserModel
  UsersRepository -->|injects| UserModel
  SessionRepository -->|injects| SessionEntityModel
  SessionsQueryRepository -->|injects| SessionEntityModel
  CreateUserUseCase -->|injects| UsersRepository
  CreateUserUseCase -->|injects| PasswordService
  DeleteUserUseCase -->|injects| UsersRepository
  LoginUserUseCase -->|injects| JwtAdapter
  LoginUserUseCase -->|injects| SessionRepository
  RegisterUserUseCase -->|injects| UsersRepository
  RegisterUserUseCase -->|injects| PasswordService
  RegisterUserUseCase -->|injects| EmailService
  ConfirmCodeUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| EmailService
  NewPasswordRecoveryUseCase -->|injects| UsersRepository
  NewPasswordRecoveryUseCase -->|injects| PasswordService
  PasswordRecoveryUseCase -->|injects| UsersRepository
  PasswordRecoveryUseCase -->|injects| EmailService
  RefreshTokenUseCase -->|injects| JwtAdapter
  RefreshTokenUseCase -->|injects| SessionRepository
  LogoutUserUseCase -->|injects| SessionRepository
  DeleteAllDevicesSessionsUseCase -->|injects| SessionRepository
  DeleteDeviceSessionUseCase -->|injects| SessionRepository
  LocalStrategy -->|injects| AuthService
  JwtStrategy -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| JwtService
  RefreshTokenStrategy -->|injects| UserAccountsConfig
  UserAccountsConfig -->|injects| ConfigService
```

### NotificationsModule

```mermaid
graph LR
  EmailService["⚙️ EmailService"]
  MailerService["⚙️ MailerService"]
  EmailTemplateManager["⚙️ EmailTemplateManager"]
  EmailService -->|injects| MailerService
  EmailService -->|injects| EmailTemplateManager
```

### BloggersPlatformModule

```mermaid
graph LR
  BlogsController["🎮 BlogsController"]
  BlogsQueryRepository["🔎 BlogsQueryRepository"]
  PostsQueryRepository["🔎 PostsQueryRepository"]
  CommandBus["🚌 CommandBus"]
  PostsController["🎮 PostsController"]
  CommentsQueryRepository["🔎 CommentsQueryRepository"]
  CommentsController["🎮 CommentsController"]
  BlogsRepository["🗄️ BlogsRepository"]
  BlogModel["⚙️ BlogModel"]
  PostsRepository["🗄️ PostsRepository"]
  PostModel["⚙️ PostModel"]
  PostLikeModel["⚙️ PostLikeModel"]
  PostLikesRepository["🗄️ PostLikesRepository"]
  CommentModel["⚙️ CommentModel"]
  CommentLikeModel["⚙️ CommentLikeModel"]
  CommentsRepository["🗄️ CommentsRepository"]
  CommentLikesRepository["🗄️ CommentLikesRepository"]
  CreateBlogUseCase["🧩 CreateBlogUseCase"]
  UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  CreatePostUseCase["🧩 CreatePostUseCase"]
  UpdatePostUseCase["🧩 UpdatePostUseCase"]
  DeletePostUseCase["🧩 DeletePostUseCase"]
  CreateCommentForPostUseCase["🧩 CreateCommentForPostUseCase"]
  UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  UpdateCommentUseCase["🧩 UpdateCommentUseCase"]
  DeleteCommentUseCase["🧩 DeleteCommentUseCase"]
  UpdateLikeStatusUseCase["🧩 UpdateLikeStatusUseCase"]
  UpdatePostLikeStatusUseCase["🧩 UpdatePostLikeStatusUseCase"]
  BlogsController -->|injects| BlogsQueryRepository
  BlogsController -->|injects| PostsQueryRepository
  BlogsController -->|injects| CommandBus
  PostsController -->|injects| CommandBus
  PostsController -->|injects| PostsQueryRepository
  PostsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommandBus
  BlogsRepository -->|injects| BlogModel
  BlogsQueryRepository -->|injects| BlogModel
  PostsRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostLikeModel
  PostLikesRepository -->|injects| PostLikeModel
  CommentsQueryRepository -->|injects| CommentModel
  CommentsQueryRepository -->|injects| CommentLikeModel
  CommentsRepository -->|injects| CommentModel
  CommentLikesRepository -->|injects| CommentLikeModel
  CreateBlogUseCase -->|injects| BlogsRepository
  UpdateBlogUseCase -->|injects| BlogsRepository
  DeleteBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| PostsRepository
  CreatePostUseCase -->|injects| BlogsRepository
  CreatePostUseCase -->|injects| PostsRepository
  UpdatePostUseCase -->|injects| PostsRepository
  DeletePostUseCase -->|injects| PostsRepository
  CreateCommentForPostUseCase -->|injects| UsersExternalQueryRepository
  CreateCommentForPostUseCase -->|injects| PostsQueryRepository
  CreateCommentForPostUseCase -->|injects| CommentsRepository
  UpdateCommentUseCase -->|injects| CommentsRepository
  DeleteCommentUseCase -->|injects| CommentsRepository
  UpdateLikeStatusUseCase -->|injects| CommentLikesRepository
  UpdateLikeStatusUseCase -->|injects| CommentsRepository
  UpdatePostLikeStatusUseCase -->|injects| PostsRepository
  UpdatePostLikeStatusUseCase -->|injects| PostLikesRepository
  UpdatePostLikeStatusUseCase -->|injects| UsersExternalQueryRepository
```

### TestingModule

```mermaid
graph LR
  TestingController["🎮 TestingController"]
  DatabaseConnection["⚙️ DatabaseConnection"]
  TestingController -->|injects| DatabaseConnection
```

### CoreModule

```mermaid
graph LR
  CoreConfig["⚙️ CoreConfig"]
  ConfigService["⚙️ ConfigService"]
  CoreConfig -->|injects| ConfigService
```

### UserAccountsModule

```mermaid
graph LR
  UsersController["🎮 UsersController"]
  CommandBus["🚌 CommandBus"]
  UsersQueryRepository["🔎 UsersQueryRepository"]
  AuthController["🎮 AuthController"]
  AuthQueryRepository["🔎 AuthQueryRepository"]
  SecurityDevicesController["🎮 SecurityDevicesController"]
  SessionsQueryRepository["🔎 SessionsQueryRepository"]
  AuthService["⚙️ AuthService"]
  UsersRepository["🗄️ UsersRepository"]
  PasswordService["⚙️ PasswordService"]
  UserModel["⚙️ UserModel"]
  UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  SessionRepository["🗄️ SessionRepository"]
  SessionEntityModel["⚙️ SessionEntityModel"]
  CreateUserUseCase["🧩 CreateUserUseCase"]
  DeleteUserUseCase["🧩 DeleteUserUseCase"]
  LoginUserUseCase["🧩 LoginUserUseCase"]
  JwtAdapter["⚙️ JwtAdapter"]
  RegisterUserUseCase["🧩 RegisterUserUseCase"]
  EmailService["⚙️ EmailService"]
  ConfirmCodeUseCase["🧩 ConfirmCodeUseCase"]
  RegisterEmailResendingUseCase["🧩 RegisterEmailResendingUseCase"]
  NewPasswordRecoveryUseCase["🧩 NewPasswordRecoveryUseCase"]
  PasswordRecoveryUseCase["🧩 PasswordRecoveryUseCase"]
  RefreshTokenUseCase["🧩 RefreshTokenUseCase"]
  LogoutUserUseCase["🧩 LogoutUserUseCase"]
  DeleteAllDevicesSessionsUseCase["🧩 DeleteAllDevicesSessionsUseCase"]
  DeleteDeviceSessionUseCase["🧩 DeleteDeviceSessionUseCase"]
  LocalStrategy["🔐 LocalStrategy"]
  JwtStrategy["🔐 JwtStrategy"]
  UserAccountsConfig["⚙️ UserAccountsConfig"]
  JwtService["⚙️ JwtService"]
  RefreshTokenStrategy["🔐 RefreshTokenStrategy"]
  ConfigService["⚙️ ConfigService"]
  UsersController -->|injects| CommandBus
  UsersController -->|injects| UsersQueryRepository
  AuthController -->|injects| AuthQueryRepository
  AuthController -->|injects| CommandBus
  SecurityDevicesController -->|injects| CommandBus
  SecurityDevicesController -->|injects| SessionsQueryRepository
  AuthService -->|injects| UsersRepository
  AuthService -->|injects| PasswordService
  AuthQueryRepository -->|injects| UserModel
  UsersExternalQueryRepository -->|injects| UserModel
  UsersQueryRepository -->|injects| UserModel
  UsersRepository -->|injects| UserModel
  SessionRepository -->|injects| SessionEntityModel
  SessionsQueryRepository -->|injects| SessionEntityModel
  CreateUserUseCase -->|injects| UsersRepository
  CreateUserUseCase -->|injects| PasswordService
  DeleteUserUseCase -->|injects| UsersRepository
  LoginUserUseCase -->|injects| JwtAdapter
  LoginUserUseCase -->|injects| SessionRepository
  RegisterUserUseCase -->|injects| UsersRepository
  RegisterUserUseCase -->|injects| PasswordService
  RegisterUserUseCase -->|injects| EmailService
  ConfirmCodeUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| EmailService
  NewPasswordRecoveryUseCase -->|injects| UsersRepository
  NewPasswordRecoveryUseCase -->|injects| PasswordService
  PasswordRecoveryUseCase -->|injects| UsersRepository
  PasswordRecoveryUseCase -->|injects| EmailService
  RefreshTokenUseCase -->|injects| JwtAdapter
  RefreshTokenUseCase -->|injects| SessionRepository
  LogoutUserUseCase -->|injects| SessionRepository
  DeleteAllDevicesSessionsUseCase -->|injects| SessionRepository
  DeleteDeviceSessionUseCase -->|injects| SessionRepository
  LocalStrategy -->|injects| AuthService
  JwtStrategy -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| JwtService
  RefreshTokenStrategy -->|injects| UserAccountsConfig
  UserAccountsConfig -->|injects| ConfigService
```

### NotificationsModule

```mermaid
graph LR
  EmailService["⚙️ EmailService"]
  MailerService["⚙️ MailerService"]
  EmailTemplateManager["⚙️ EmailTemplateManager"]
  EmailService -->|injects| MailerService
  EmailService -->|injects| EmailTemplateManager
```

### BloggersPlatformModule

```mermaid
graph LR
  BlogsController["🎮 BlogsController"]
  BlogsQueryRepository["🔎 BlogsQueryRepository"]
  PostsQueryRepository["🔎 PostsQueryRepository"]
  CommandBus["🚌 CommandBus"]
  PostsController["🎮 PostsController"]
  CommentsQueryRepository["🔎 CommentsQueryRepository"]
  CommentsController["🎮 CommentsController"]
  BlogsRepository["🗄️ BlogsRepository"]
  BlogModel["⚙️ BlogModel"]
  PostsRepository["🗄️ PostsRepository"]
  PostModel["⚙️ PostModel"]
  PostLikeModel["⚙️ PostLikeModel"]
  PostLikesRepository["🗄️ PostLikesRepository"]
  CommentModel["⚙️ CommentModel"]
  CommentLikeModel["⚙️ CommentLikeModel"]
  CommentsRepository["🗄️ CommentsRepository"]
  CommentLikesRepository["🗄️ CommentLikesRepository"]
  CreateBlogUseCase["🧩 CreateBlogUseCase"]
  UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  CreatePostUseCase["🧩 CreatePostUseCase"]
  UpdatePostUseCase["🧩 UpdatePostUseCase"]
  DeletePostUseCase["🧩 DeletePostUseCase"]
  CreateCommentForPostUseCase["🧩 CreateCommentForPostUseCase"]
  UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  UpdateCommentUseCase["🧩 UpdateCommentUseCase"]
  DeleteCommentUseCase["🧩 DeleteCommentUseCase"]
  UpdateLikeStatusUseCase["🧩 UpdateLikeStatusUseCase"]
  UpdatePostLikeStatusUseCase["🧩 UpdatePostLikeStatusUseCase"]
  BlogsController -->|injects| BlogsQueryRepository
  BlogsController -->|injects| PostsQueryRepository
  BlogsController -->|injects| CommandBus
  PostsController -->|injects| CommandBus
  PostsController -->|injects| PostsQueryRepository
  PostsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommandBus
  BlogsRepository -->|injects| BlogModel
  BlogsQueryRepository -->|injects| BlogModel
  PostsRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostLikeModel
  PostLikesRepository -->|injects| PostLikeModel
  CommentsQueryRepository -->|injects| CommentModel
  CommentsQueryRepository -->|injects| CommentLikeModel
  CommentsRepository -->|injects| CommentModel
  CommentLikesRepository -->|injects| CommentLikeModel
  CreateBlogUseCase -->|injects| BlogsRepository
  UpdateBlogUseCase -->|injects| BlogsRepository
  DeleteBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| PostsRepository
  CreatePostUseCase -->|injects| BlogsRepository
  CreatePostUseCase -->|injects| PostsRepository
  UpdatePostUseCase -->|injects| PostsRepository
  DeletePostUseCase -->|injects| PostsRepository
  CreateCommentForPostUseCase -->|injects| UsersExternalQueryRepository
  CreateCommentForPostUseCase -->|injects| PostsQueryRepository
  CreateCommentForPostUseCase -->|injects| CommentsRepository
  UpdateCommentUseCase -->|injects| CommentsRepository
  DeleteCommentUseCase -->|injects| CommentsRepository
  UpdateLikeStatusUseCase -->|injects| CommentLikesRepository
  UpdateLikeStatusUseCase -->|injects| CommentsRepository
  UpdatePostLikeStatusUseCase -->|injects| PostsRepository
  UpdatePostLikeStatusUseCase -->|injects| PostLikesRepository
  UpdatePostLikeStatusUseCase -->|injects| UsersExternalQueryRepository
```

### UserAccountsModule

```mermaid
graph LR
  UsersController["🎮 UsersController"]
  CommandBus["🚌 CommandBus"]
  UsersQueryRepository["🔎 UsersQueryRepository"]
  AuthController["🎮 AuthController"]
  AuthQueryRepository["🔎 AuthQueryRepository"]
  SecurityDevicesController["🎮 SecurityDevicesController"]
  SessionsQueryRepository["🔎 SessionsQueryRepository"]
  AuthService["⚙️ AuthService"]
  UsersRepository["🗄️ UsersRepository"]
  PasswordService["⚙️ PasswordService"]
  UserModel["⚙️ UserModel"]
  UsersExternalQueryRepository["🔎 UsersExternalQueryRepository"]
  SessionRepository["🗄️ SessionRepository"]
  SessionEntityModel["⚙️ SessionEntityModel"]
  CreateUserUseCase["🧩 CreateUserUseCase"]
  DeleteUserUseCase["🧩 DeleteUserUseCase"]
  LoginUserUseCase["🧩 LoginUserUseCase"]
  JwtAdapter["⚙️ JwtAdapter"]
  RegisterUserUseCase["🧩 RegisterUserUseCase"]
  EmailService["⚙️ EmailService"]
  ConfirmCodeUseCase["🧩 ConfirmCodeUseCase"]
  RegisterEmailResendingUseCase["🧩 RegisterEmailResendingUseCase"]
  NewPasswordRecoveryUseCase["🧩 NewPasswordRecoveryUseCase"]
  PasswordRecoveryUseCase["🧩 PasswordRecoveryUseCase"]
  RefreshTokenUseCase["🧩 RefreshTokenUseCase"]
  LogoutUserUseCase["🧩 LogoutUserUseCase"]
  DeleteAllDevicesSessionsUseCase["🧩 DeleteAllDevicesSessionsUseCase"]
  DeleteDeviceSessionUseCase["🧩 DeleteDeviceSessionUseCase"]
  LocalStrategy["🔐 LocalStrategy"]
  JwtStrategy["🔐 JwtStrategy"]
  UserAccountsConfig["⚙️ UserAccountsConfig"]
  JwtService["⚙️ JwtService"]
  RefreshTokenStrategy["🔐 RefreshTokenStrategy"]
  ConfigService["⚙️ ConfigService"]
  UsersController -->|injects| CommandBus
  UsersController -->|injects| UsersQueryRepository
  AuthController -->|injects| AuthQueryRepository
  AuthController -->|injects| CommandBus
  SecurityDevicesController -->|injects| CommandBus
  SecurityDevicesController -->|injects| SessionsQueryRepository
  AuthService -->|injects| UsersRepository
  AuthService -->|injects| PasswordService
  AuthQueryRepository -->|injects| UserModel
  UsersExternalQueryRepository -->|injects| UserModel
  UsersQueryRepository -->|injects| UserModel
  UsersRepository -->|injects| UserModel
  SessionRepository -->|injects| SessionEntityModel
  SessionsQueryRepository -->|injects| SessionEntityModel
  CreateUserUseCase -->|injects| UsersRepository
  CreateUserUseCase -->|injects| PasswordService
  DeleteUserUseCase -->|injects| UsersRepository
  LoginUserUseCase -->|injects| JwtAdapter
  LoginUserUseCase -->|injects| SessionRepository
  RegisterUserUseCase -->|injects| UsersRepository
  RegisterUserUseCase -->|injects| PasswordService
  RegisterUserUseCase -->|injects| EmailService
  ConfirmCodeUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| UsersRepository
  RegisterEmailResendingUseCase -->|injects| EmailService
  NewPasswordRecoveryUseCase -->|injects| UsersRepository
  NewPasswordRecoveryUseCase -->|injects| PasswordService
  PasswordRecoveryUseCase -->|injects| UsersRepository
  PasswordRecoveryUseCase -->|injects| EmailService
  RefreshTokenUseCase -->|injects| JwtAdapter
  RefreshTokenUseCase -->|injects| SessionRepository
  LogoutUserUseCase -->|injects| SessionRepository
  DeleteAllDevicesSessionsUseCase -->|injects| SessionRepository
  DeleteDeviceSessionUseCase -->|injects| SessionRepository
  LocalStrategy -->|injects| AuthService
  JwtStrategy -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| UserAccountsConfig
  JwtAdapter -->|injects| JwtService
  RefreshTokenStrategy -->|injects| UserAccountsConfig
  UserAccountsConfig -->|injects| ConfigService
```

### NotificationsModule

```mermaid
graph LR
  EmailService["⚙️ EmailService"]
  MailerService["⚙️ MailerService"]
  EmailTemplateManager["⚙️ EmailTemplateManager"]
  EmailService -->|injects| MailerService
  EmailService -->|injects| EmailTemplateManager
```

### NotificationsModule

```mermaid
graph LR
  EmailService["⚙️ EmailService"]
  MailerService["⚙️ MailerService"]
  EmailTemplateManager["⚙️ EmailTemplateManager"]
  EmailService -->|injects| MailerService
  EmailService -->|injects| EmailTemplateManager
```

### CoreModule

```mermaid
graph LR
  CoreConfig["⚙️ CoreConfig"]
  ConfigService["⚙️ ConfigService"]
  CoreConfig -->|injects| ConfigService
```

## 4. CQRS

```mermaid
graph LR
  command_CreateUserCommand["📨 CreateUserCommand"]
  handler_CreateUserUseCase["🧩 CreateUserUseCase"]
  command_DeleteUserCommand["📨 DeleteUserCommand"]
  handler_DeleteUserUseCase["🧩 DeleteUserUseCase"]
  command_LoginUserCommand["📨 LoginUserCommand"]
  handler_LoginUserUseCase["🧩 LoginUserUseCase"]
  command_RegisterUserCommand["📨 RegisterUserCommand"]
  handler_RegisterUserUseCase["🧩 RegisterUserUseCase"]
  command_ConfirmCodeCommand["📨 ConfirmCodeCommand"]
  handler_ConfirmCodeUseCase["🧩 ConfirmCodeUseCase"]
  command_RegisterEmailResendingCommand["📨 RegisterEmailResendingCommand"]
  handler_RegisterEmailResendingUseCase["🧩 RegisterEmailResendingUseCase"]
  command_NewPasswordRecoveryCommand["📨 NewPasswordRecoveryCommand"]
  handler_NewPasswordRecoveryUseCase["🧩 NewPasswordRecoveryUseCase"]
  command_PasswordRecoveryCommand["📨 PasswordRecoveryCommand"]
  handler_PasswordRecoveryUseCase["🧩 PasswordRecoveryUseCase"]
  command_RefreshTokenCommand["📨 RefreshTokenCommand"]
  handler_RefreshTokenUseCase["🧩 RefreshTokenUseCase"]
  command_LogoutUserCommand["📨 LogoutUserCommand"]
  handler_LogoutUserUseCase["🧩 LogoutUserUseCase"]
  command_DeleteAllDevicesSessionsCommand["📨 DeleteAllDevicesSessionsCommand"]
  handler_DeleteAllDevicesSessionsUseCase["🧩 DeleteAllDevicesSessionsUseCase"]
  command_DeleteDeviceSessionCommand["📨 DeleteDeviceSessionCommand"]
  handler_DeleteDeviceSessionUseCase["🧩 DeleteDeviceSessionUseCase"]
  command_CreateBlogCommand["📨 CreateBlogCommand"]
  handler_CreateBlogUseCase["🧩 CreateBlogUseCase"]
  command_UpdateBlogCommand["📨 UpdateBlogCommand"]
  handler_UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  command_DeleteBlogCommand["📨 DeleteBlogCommand"]
  handler_DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  command_CreatePostForBlogCommand["📨 CreatePostForBlogCommand"]
  handler_CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  command_CreatePostCommand["📨 CreatePostCommand"]
  handler_CreatePostUseCase["🧩 CreatePostUseCase"]
  command_UpdatePostCommand["📨 UpdatePostCommand"]
  handler_UpdatePostUseCase["🧩 UpdatePostUseCase"]
  command_DeletePostCommand["📨 DeletePostCommand"]
  handler_DeletePostUseCase["🧩 DeletePostUseCase"]
  command_CreateCommentForPostCommand["📨 CreateCommentForPostCommand"]
  handler_CreateCommentForPostUseCase["🧩 CreateCommentForPostUseCase"]
  command_UpdateCommentCommand["📨 UpdateCommentCommand"]
  handler_UpdateCommentUseCase["🧩 UpdateCommentUseCase"]
  command_DeleteCommentCommand["📨 DeleteCommentCommand"]
  handler_DeleteCommentUseCase["🧩 DeleteCommentUseCase"]
  command_UpdateLikeStatusCommand["📨 UpdateLikeStatusCommand"]
  handler_UpdateLikeStatusUseCase["🧩 UpdateLikeStatusUseCase"]
  command_UpdatePostLikeStatusCommand["📨 UpdatePostLikeStatusCommand"]
  handler_UpdatePostLikeStatusUseCase["🧩 UpdatePostLikeStatusUseCase"]
  command_CreateUserCommand -->|handled by| handler_CreateUserUseCase
  command_DeleteUserCommand -->|handled by| handler_DeleteUserUseCase
  command_LoginUserCommand -->|handled by| handler_LoginUserUseCase
  command_RegisterUserCommand -->|handled by| handler_RegisterUserUseCase
  command_ConfirmCodeCommand -->|handled by| handler_ConfirmCodeUseCase
  command_RegisterEmailResendingCommand -->|handled by| handler_RegisterEmailResendingUseCase
  command_NewPasswordRecoveryCommand -->|handled by| handler_NewPasswordRecoveryUseCase
  command_PasswordRecoveryCommand -->|handled by| handler_PasswordRecoveryUseCase
  command_RefreshTokenCommand -->|handled by| handler_RefreshTokenUseCase
  command_LogoutUserCommand -->|handled by| handler_LogoutUserUseCase
  command_DeleteAllDevicesSessionsCommand -->|handled by| handler_DeleteAllDevicesSessionsUseCase
  command_DeleteDeviceSessionCommand -->|handled by| handler_DeleteDeviceSessionUseCase
  command_CreateBlogCommand -->|handled by| handler_CreateBlogUseCase
  command_UpdateBlogCommand -->|handled by| handler_UpdateBlogUseCase
  command_DeleteBlogCommand -->|handled by| handler_DeleteBlogUseCase
  command_CreatePostForBlogCommand -->|handled by| handler_CreatePostForBlogUseCase
  command_CreatePostCommand -->|handled by| handler_CreatePostUseCase
  command_UpdatePostCommand -->|handled by| handler_UpdatePostUseCase
  command_DeletePostCommand -->|handled by| handler_DeletePostUseCase
  command_CreateCommentForPostCommand -->|handled by| handler_CreateCommentForPostUseCase
  command_UpdateCommentCommand -->|handled by| handler_UpdateCommentUseCase
  command_DeleteCommentCommand -->|handled by| handler_DeleteCommentUseCase
  command_UpdateLikeStatusCommand -->|handled by| handler_UpdateLikeStatusUseCase
  command_UpdatePostLikeStatusCommand -->|handled by| handler_UpdatePostLikeStatusUseCase
  command_CreateUserCommand -->|handled by| handler_CreateUserUseCase
  command_DeleteUserCommand -->|handled by| handler_DeleteUserUseCase
  command_LoginUserCommand -->|handled by| handler_LoginUserUseCase
  command_RegisterUserCommand -->|handled by| handler_RegisterUserUseCase
  command_ConfirmCodeCommand -->|handled by| handler_ConfirmCodeUseCase
  command_RegisterEmailResendingCommand -->|handled by| handler_RegisterEmailResendingUseCase
  command_NewPasswordRecoveryCommand -->|handled by| handler_NewPasswordRecoveryUseCase
  command_PasswordRecoveryCommand -->|handled by| handler_PasswordRecoveryUseCase
  command_RefreshTokenCommand -->|handled by| handler_RefreshTokenUseCase
  command_LogoutUserCommand -->|handled by| handler_LogoutUserUseCase
  command_DeleteAllDevicesSessionsCommand -->|handled by| handler_DeleteAllDevicesSessionsUseCase
  command_DeleteDeviceSessionCommand -->|handled by| handler_DeleteDeviceSessionUseCase
  command_CreateBlogCommand -->|handled by| handler_CreateBlogUseCase
  command_UpdateBlogCommand -->|handled by| handler_UpdateBlogUseCase
  command_DeleteBlogCommand -->|handled by| handler_DeleteBlogUseCase
  command_CreatePostForBlogCommand -->|handled by| handler_CreatePostForBlogUseCase
  command_CreatePostCommand -->|handled by| handler_CreatePostUseCase
  command_UpdatePostCommand -->|handled by| handler_UpdatePostUseCase
  command_DeletePostCommand -->|handled by| handler_DeletePostUseCase
  command_CreateCommentForPostCommand -->|handled by| handler_CreateCommentForPostUseCase
  command_UpdateCommentCommand -->|handled by| handler_UpdateCommentUseCase
  command_DeleteCommentCommand -->|handled by| handler_DeleteCommentUseCase
  command_UpdateLikeStatusCommand -->|handled by| handler_UpdateLikeStatusUseCase
  command_UpdatePostLikeStatusCommand -->|handled by| handler_UpdatePostLikeStatusUseCase
  command_CreateUserCommand -->|handled by| handler_CreateUserUseCase
  command_DeleteUserCommand -->|handled by| handler_DeleteUserUseCase
  command_LoginUserCommand -->|handled by| handler_LoginUserUseCase
  command_RegisterUserCommand -->|handled by| handler_RegisterUserUseCase
  command_ConfirmCodeCommand -->|handled by| handler_ConfirmCodeUseCase
  command_RegisterEmailResendingCommand -->|handled by| handler_RegisterEmailResendingUseCase
  command_NewPasswordRecoveryCommand -->|handled by| handler_NewPasswordRecoveryUseCase
  command_PasswordRecoveryCommand -->|handled by| handler_PasswordRecoveryUseCase
  command_RefreshTokenCommand -->|handled by| handler_RefreshTokenUseCase
  command_LogoutUserCommand -->|handled by| handler_LogoutUserUseCase
  command_DeleteAllDevicesSessionsCommand -->|handled by| handler_DeleteAllDevicesSessionsUseCase
  command_DeleteDeviceSessionCommand -->|handled by| handler_DeleteDeviceSessionUseCase
```
