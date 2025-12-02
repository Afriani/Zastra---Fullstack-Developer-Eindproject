package com.zastra.zastra.infra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GoogleUserInfo {

    private String id;
    private String email;
    private String name;

    @JsonProperty("picture")
    private String pictureUrl;

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

}
