// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package com.fasterxml.jackson.core;


// Referenced classes of package com.fasterxml.jackson.core:
//            JsonGenerator

public static final class _defaultState extends Enum
{

    private static final IGNORE_UNKNOWN $VALUES[];
    public static final IGNORE_UNKNOWN AUTO_CLOSE_JSON_CONTENT;
    public static final IGNORE_UNKNOWN AUTO_CLOSE_TARGET;
    public static final IGNORE_UNKNOWN ESCAPE_NON_ASCII;
    public static final IGNORE_UNKNOWN FLUSH_PASSED_TO_STREAM;
    public static final IGNORE_UNKNOWN IGNORE_UNKNOWN;
    public static final IGNORE_UNKNOWN QUOTE_FIELD_NAMES;
    public static final IGNORE_UNKNOWN QUOTE_NON_NUMERIC_NUMBERS;
    public static final IGNORE_UNKNOWN STRICT_DUPLICATE_DETECTION;
    public static final IGNORE_UNKNOWN WRITE_BIGDECIMAL_AS_PLAIN;
    public static final IGNORE_UNKNOWN WRITE_NUMBERS_AS_STRINGS;
    private final boolean _defaultState;
    private final int _mask = 1 << ordinal();

    public static int collectDefaults()
    {
        int j = 0;
        _defaultState a_ldefaultstate[] = values();
        int l = a_ldefaultstate.length;
        for (int i = 0; i < l;)
        {
            _defaultState _ldefaultstate = a_ldefaultstate[i];
            int k = j;
            if (_ldefaultstate.enabledByDefault())
            {
                k = j | _ldefaultstate.getMask();
            }
            i++;
            j = k;
        }

        return j;
    }

    public static getMask valueOf(String s)
    {
        return (getMask)Enum.valueOf(com/fasterxml/jackson/core/JsonGenerator$Feature, s);
    }

    public static getMask[] values()
    {
        return (getMask[])$VALUES.clone();
    }

    public final boolean enabledByDefault()
    {
        return _defaultState;
    }

    public final boolean enabledIn(int i)
    {
        return (_mask & i) != 0;
    }

    public final int getMask()
    {
        return _mask;
    }

    static 
    {
        AUTO_CLOSE_TARGET = new <init>("AUTO_CLOSE_TARGET", 0, true);
        AUTO_CLOSE_JSON_CONTENT = new <init>("AUTO_CLOSE_JSON_CONTENT", 1, true);
        FLUSH_PASSED_TO_STREAM = new <init>("FLUSH_PASSED_TO_STREAM", 2, true);
        QUOTE_FIELD_NAMES = new <init>("QUOTE_FIELD_NAMES", 3, true);
        QUOTE_NON_NUMERIC_NUMBERS = new <init>("QUOTE_NON_NUMERIC_NUMBERS", 4, true);
        WRITE_NUMBERS_AS_STRINGS = new <init>("WRITE_NUMBERS_AS_STRINGS", 5, false);
        WRITE_BIGDECIMAL_AS_PLAIN = new <init>("WRITE_BIGDECIMAL_AS_PLAIN", 6, false);
        ESCAPE_NON_ASCII = new <init>("ESCAPE_NON_ASCII", 7, false);
        STRICT_DUPLICATE_DETECTION = new <init>("STRICT_DUPLICATE_DETECTION", 8, false);
        IGNORE_UNKNOWN = new <init>("IGNORE_UNKNOWN", 9, false);
        $VALUES = (new .VALUES[] {
            AUTO_CLOSE_TARGET, AUTO_CLOSE_JSON_CONTENT, FLUSH_PASSED_TO_STREAM, QUOTE_FIELD_NAMES, QUOTE_NON_NUMERIC_NUMBERS, WRITE_NUMBERS_AS_STRINGS, WRITE_BIGDECIMAL_AS_PLAIN, ESCAPE_NON_ASCII, STRICT_DUPLICATE_DETECTION, IGNORE_UNKNOWN
        });
    }

    private (String s, int i, boolean flag)
    {
        super(s, i);
        _defaultState = flag;
    }
}
