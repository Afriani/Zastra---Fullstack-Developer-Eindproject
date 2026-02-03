package com.zastra.zastra.media.service;

import java.io.InputStream;

public class MediaRecord {

    public final String filename;
    public final String contentType;
    public final long size;
    public final InputStream inputStream;

    public MediaRecord(String filename, String contentType, long size, InputStream inputStream) {
        this.filename = filename;
        this.contentType = contentType;
        this.size = size;
        this.inputStream = inputStream;
    }

}
