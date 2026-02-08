package com.zastra.zastra.infra.util;

import com.zastra.zastra.infra.dto.FacebookTokenResponse;
import com.zastra.zastra.infra.dto.FacebookUserInfo;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FacebookOAuthUtil {

    private static final String TOKEN_URL = "https://graph.facebook.com/v18.0/oauth/access_token";
    private static final String USER_INFO_URL = "https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture";

    public static FacebookTokenResponse exchangeCodeForTokens(String code, String clientId, String clientSecret, String redirectUri) {
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<FacebookTokenResponse> response = restTemplate.postForEntity(TOKEN_URL, request, FacebookTokenResponse.class);
        return response.getBody();
    }

    public static FacebookUserInfo getUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();

        try {
            // Append access_token as query param
            String url = USER_INFO_URL + "&access_token=" + accessToken;

            ResponseEntity<FacebookUserInfo> response = restTemplate.getForEntity(url, FacebookUserInfo.class);

            FacebookUserInfo userInfo = response.getBody();

            log.info("Facebook user info fetched: id={}, email={}",
                    userInfo != null ? userInfo.getId() : "null",
                    userInfo != null ? userInfo.getEmail() : "null");

            return userInfo;
        } catch (Exception e) {
            log.error("Error fetching Facebook user info", e);
            throw new RuntimeException("Failed to fetch Facebook user info", e);
        }
    }

}


