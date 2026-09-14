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
  AppModule_APP_FILTER__UUID__7917f131bc03718588cd8_["⚙️ APP_FILTER (UUID: 7917f131bc03718588cd8)"]
  AppModule --> AppModule_APP_FILTER__UUID__7917f131bc03718588cd8_
  AppModule_APP_FILTER__UUID__17f131bc03718588cd876_["⚙️ APP_FILTER (UUID: 17f131bc03718588cd876)"]
  AppModule --> AppModule_APP_FILTER__UUID__17f131bc03718588cd876_
  UserAccountsModule["📦 UserAccountsModule"]
  UserAccountsModule_UsersController["🎮 UsersController"]
  UserAccountsModule --> UserAccountsModule_UsersController
  UserAccountsModule_AuthController["🎮 AuthController"]
  UserAccountsModule --> UserAccountsModule_AuthController
  UserAccountsModule_AuthService["⚙️ AuthService"]
  UserAccountsModule --> UserAccountsModule_AuthService
  UserAccountsModule_AuthQueryRepository["🔎 AuthQueryRepository"]
  UserAccountsModule --> UserAccountsModule_AuthQueryRepository
  UserAccountsModule_UsersQueryRepository["🔎 UsersQueryRepository"]
  UserAccountsModule --> UserAccountsModule_UsersQueryRepository
  UserAccountsModule_UsersRepository["🗄️ UsersRepository"]
  UserAccountsModule --> UserAccountsModule_UsersRepository
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
  UserAccountsModule_LocalStrategy["🔐 LocalStrategy"]
  UserAccountsModule --> UserAccountsModule_LocalStrategy
  UserAccountsModule_JwtStrategy["🔐 JwtStrategy"]
  UserAccountsModule --> UserAccountsModule_JwtStrategy
  UserAccountsModule_JwtAdapter["⚙️ JwtAdapter"]
  UserAccountsModule --> UserAccountsModule_JwtAdapter
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
  BloggersPlatformModule_PostsService["⚙️ PostsService"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsService
  BloggersPlatformModule_PostsRepository["🗄️ PostsRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsRepository
  BloggersPlatformModule_PostsQueryRepository["🔎 PostsQueryRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_PostsQueryRepository
  BloggersPlatformModule_CommentsQueryRepository["🔎 CommentsQueryRepository"]
  BloggersPlatformModule --> BloggersPlatformModule_CommentsQueryRepository
  BloggersPlatformModule_CreateBlogUseCase["🧩 CreateBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreateBlogUseCase
  BloggersPlatformModule_UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_UpdateBlogUseCase
  BloggersPlatformModule_DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_DeleteBlogUseCase
  BloggersPlatformModule_CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  BloggersPlatformModule --> BloggersPlatformModule_CreatePostForBlogUseCase
  TestingModule["📦 TestingModule"]
  TestingModule_TestingController["🎮 TestingController"]
  TestingModule --> TestingModule_TestingController
  CoreModule["📦 CoreModule"]
```

## 3. Dependency Injection

### AppModule

```mermaid
graph LR
  AppController["🎮 AppController"]
  AppService["⚙️ AppService"]
  APP_FILTER["⚙️ APP_FILTER"]
  AppController -->|injects| AppService
```

### UserAccountsModule

```mermaid
graph LR
  UsersController["🎮 UsersController"]
  CommandBus["🚌 CommandBus"]
  UsersQueryRepository["🔎 UsersQueryRepository"]
  AuthController["🎮 AuthController"]
  AuthQueryRepository["🔎 AuthQueryRepository"]
  AuthService["⚙️ AuthService"]
  UsersRepository["🗄️ UsersRepository"]
  PasswordService["⚙️ PasswordService"]
  UserModel["⚙️ UserModel"]
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
  LocalStrategy["🔐 LocalStrategy"]
  JwtStrategy["🔐 JwtStrategy"]
  JwtService["⚙️ JwtService"]
  UsersController -->|injects| CommandBus
  UsersController -->|injects| UsersQueryRepository
  AuthController -->|injects| AuthQueryRepository
  AuthController -->|injects| CommandBus
  AuthService -->|injects| UsersRepository
  AuthService -->|injects| PasswordService
  AuthQueryRepository -->|injects| UserModel
  UsersQueryRepository -->|injects| UserModel
  UsersRepository -->|injects| UserModel
  CreateUserUseCase -->|injects| UsersRepository
  CreateUserUseCase -->|injects| PasswordService
  DeleteUserUseCase -->|injects| UsersRepository
  LoginUserUseCase -->|injects| JwtAdapter
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
  LocalStrategy -->|injects| AuthService
  JwtAdapter -->|injects| JwtService
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
  PostsService["⚙️ PostsService"]
  CommentsQueryRepository["🔎 CommentsQueryRepository"]
  CommentsController["🎮 CommentsController"]
  BlogsRepository["🗄️ BlogsRepository"]
  BlogModel["⚙️ BlogModel"]
  PostsRepository["🗄️ PostsRepository"]
  PostModel["⚙️ PostModel"]
  PostLikeModel["⚙️ PostLikeModel"]
  CommentModel["⚙️ CommentModel"]
  CreateBlogUseCase["🧩 CreateBlogUseCase"]
  UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  BlogsController -->|injects| BlogsQueryRepository
  BlogsController -->|injects| PostsQueryRepository
  BlogsController -->|injects| CommandBus
  PostsController -->|injects| PostsService
  PostsController -->|injects| PostsQueryRepository
  PostsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommentsQueryRepository
  BlogsRepository -->|injects| BlogModel
  BlogsQueryRepository -->|injects| BlogModel
  PostsService -->|injects| PostsRepository
  PostsService -->|injects| BlogsRepository
  PostsRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostLikeModel
  CommentsQueryRepository -->|injects| CommentModel
  CreateBlogUseCase -->|injects| BlogsRepository
  UpdateBlogUseCase -->|injects| BlogsRepository
  DeleteBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| PostsRepository
```

### TestingModule

```mermaid
graph LR
  TestingController["🎮 TestingController"]
  DatabaseConnection["⚙️ DatabaseConnection"]
  TestingController -->|injects| DatabaseConnection
```

### UserAccountsModule

```mermaid
graph LR
  UsersController["🎮 UsersController"]
  CommandBus["🚌 CommandBus"]
  UsersQueryRepository["🔎 UsersQueryRepository"]
  AuthController["🎮 AuthController"]
  AuthQueryRepository["🔎 AuthQueryRepository"]
  AuthService["⚙️ AuthService"]
  UsersRepository["🗄️ UsersRepository"]
  PasswordService["⚙️ PasswordService"]
  UserModel["⚙️ UserModel"]
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
  LocalStrategy["🔐 LocalStrategy"]
  JwtStrategy["🔐 JwtStrategy"]
  JwtService["⚙️ JwtService"]
  UsersController -->|injects| CommandBus
  UsersController -->|injects| UsersQueryRepository
  AuthController -->|injects| AuthQueryRepository
  AuthController -->|injects| CommandBus
  AuthService -->|injects| UsersRepository
  AuthService -->|injects| PasswordService
  AuthQueryRepository -->|injects| UserModel
  UsersQueryRepository -->|injects| UserModel
  UsersRepository -->|injects| UserModel
  CreateUserUseCase -->|injects| UsersRepository
  CreateUserUseCase -->|injects| PasswordService
  DeleteUserUseCase -->|injects| UsersRepository
  LoginUserUseCase -->|injects| JwtAdapter
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
  LocalStrategy -->|injects| AuthService
  JwtAdapter -->|injects| JwtService
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
  PostsService["⚙️ PostsService"]
  CommentsQueryRepository["🔎 CommentsQueryRepository"]
  CommentsController["🎮 CommentsController"]
  BlogsRepository["🗄️ BlogsRepository"]
  BlogModel["⚙️ BlogModel"]
  PostsRepository["🗄️ PostsRepository"]
  PostModel["⚙️ PostModel"]
  PostLikeModel["⚙️ PostLikeModel"]
  CommentModel["⚙️ CommentModel"]
  CreateBlogUseCase["🧩 CreateBlogUseCase"]
  UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  BlogsController -->|injects| BlogsQueryRepository
  BlogsController -->|injects| PostsQueryRepository
  BlogsController -->|injects| CommandBus
  PostsController -->|injects| PostsService
  PostsController -->|injects| PostsQueryRepository
  PostsController -->|injects| CommentsQueryRepository
  CommentsController -->|injects| CommentsQueryRepository
  BlogsRepository -->|injects| BlogModel
  BlogsQueryRepository -->|injects| BlogModel
  PostsService -->|injects| PostsRepository
  PostsService -->|injects| BlogsRepository
  PostsRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostModel
  PostsQueryRepository -->|injects| PostLikeModel
  CommentsQueryRepository -->|injects| CommentModel
  CreateBlogUseCase -->|injects| BlogsRepository
  UpdateBlogUseCase -->|injects| BlogsRepository
  DeleteBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| BlogsRepository
  CreatePostForBlogUseCase -->|injects| PostsRepository
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
  command_CreateBlogCommand["📨 CreateBlogCommand"]
  handler_CreateBlogUseCase["🧩 CreateBlogUseCase"]
  command_UpdateBlogCommand["📨 UpdateBlogCommand"]
  handler_UpdateBlogUseCase["🧩 UpdateBlogUseCase"]
  command_DeleteBlogCommand["📨 DeleteBlogCommand"]
  handler_DeleteBlogUseCase["🧩 DeleteBlogUseCase"]
  command_CreatePostForBlogCommand["📨 CreatePostForBlogCommand"]
  handler_CreatePostForBlogUseCase["🧩 CreatePostForBlogUseCase"]
  command_CreateUserCommand -->|handled by| handler_CreateUserUseCase
  command_DeleteUserCommand -->|handled by| handler_DeleteUserUseCase
  command_LoginUserCommand -->|handled by| handler_LoginUserUseCase
  command_RegisterUserCommand -->|handled by| handler_RegisterUserUseCase
  command_ConfirmCodeCommand -->|handled by| handler_ConfirmCodeUseCase
  command_RegisterEmailResendingCommand -->|handled by| handler_RegisterEmailResendingUseCase
  command_NewPasswordRecoveryCommand -->|handled by| handler_NewPasswordRecoveryUseCase
  command_PasswordRecoveryCommand -->|handled by| handler_PasswordRecoveryUseCase
  command_CreateBlogCommand -->|handled by| handler_CreateBlogUseCase
  command_UpdateBlogCommand -->|handled by| handler_UpdateBlogUseCase
  command_DeleteBlogCommand -->|handled by| handler_DeleteBlogUseCase
  command_CreatePostForBlogCommand -->|handled by| handler_CreatePostForBlogUseCase
  command_CreateUserCommand -->|handled by| handler_CreateUserUseCase
  command_DeleteUserCommand -->|handled by| handler_DeleteUserUseCase
  command_LoginUserCommand -->|handled by| handler_LoginUserUseCase
  command_RegisterUserCommand -->|handled by| handler_RegisterUserUseCase
  command_ConfirmCodeCommand -->|handled by| handler_ConfirmCodeUseCase
  command_RegisterEmailResendingCommand -->|handled by| handler_RegisterEmailResendingUseCase
  command_NewPasswordRecoveryCommand -->|handled by| handler_NewPasswordRecoveryUseCase
  command_PasswordRecoveryCommand -->|handled by| handler_PasswordRecoveryUseCase
  command_CreateBlogCommand -->|handled by| handler_CreateBlogUseCase
  command_UpdateBlogCommand -->|handled by| handler_UpdateBlogUseCase
  command_DeleteBlogCommand -->|handled by| handler_DeleteBlogUseCase
  command_CreatePostForBlogCommand -->|handled by| handler_CreatePostForBlogUseCase
```
