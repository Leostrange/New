// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package com.fasterxml.jackson.core;


// Referenced classes of package com.fasterxml.jackson.core:
//            JsonProcessingException, JsonGenerator

public class JsonGenerationException extends JsonProcessingException
{

    protected transient JsonGenerator _processor;

    public JsonGenerationException(String s, JsonGenerator jsongenerator)
    {
        super(s, null);
        _processor = jsongenerator;
    }
}
