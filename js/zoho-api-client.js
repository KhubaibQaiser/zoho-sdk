// [POST - Generate Token] https://accounts.zoho.com/oauth/v2/token
// [POST - Refresh Token] https://accounts.zoho.com/oauth/v2/token
// [GET - Get Job Openings] https://recruit.zoho.com/recruit/v2/JobOpenings?per_page=200&page=1

class ZohoAPIClient {
  constructor(clientId, clientSecret, code) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.code = code;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async generateAccessToken() {
    const url = "https://accounts.zoho.com/oauth/v2/token";
    const body = new URLSearchParams();
    body.append("client_id", this.clientId);
    body.append("client_secret", this.clientSecret);
    body.append("code", this.code);
    body.append("grant_type", "authorization_code");

    const response = await fetch(url, {
      method: "POST",
      body,
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
  }

  async refreshAccessToken() {
    const url = "https://accounts.zoho.com/oauth/v2/token";
    const body = new URLSearchParams();
    body.append("client_id", this.clientId);
    body.append("client_secret", this.clientSecret);
    body.append("refresh_token", this.refreshToken);
    body.append("grant_type", "refresh_token");

    const response = await fetch(url, {
      method: "POST",
      body,
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async getJobOpenings(perPage = 200, page = 1) {
    if (!this.accessToken) {
      await this.generateAccessToken();
    }

    const url = `https://recruit.zoho.com/recruit/v2/JobOpenings?per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return this.getJobOpenings(perPage, page);
    }

    const data = await response.json();
    return data;
  }
}
