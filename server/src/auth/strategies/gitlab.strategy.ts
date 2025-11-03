import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-gitlab2";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class GitLabStrategy extends PassportStrategy(Strategy, "gitlab") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const gitlabConfig = {
      clientID: configService.get<string>("GITLAB_CLIENT_ID"),
      clientSecret: configService.get<string>("GITLAB_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GITLAB_REDIRECT_URI"),
      authorizationURL: `${configService.get<string>(
        "GITLAB_BASE_URL"
      )}/oauth/authorize`,
      tokenURL: `${configService.get<string>("GITLAB_BASE_URL")}/oauth/token`,
      scope: ["read_user", "api"],
    };

    super(gitlabConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, emails, username } = profile;

    try {
      const user = await this.authService.validateGitLabUser(
        id.toString(),
        emails[0].value
      );
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
}

