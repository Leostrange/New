// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import java.io.Serializable;

final class pq extends pl
    implements Serializable
{

    final Object a;
    final Object b;

    pq(Object obj, Object obj1)
    {
        a = obj;
        b = obj1;
    }

    public final Object getKey()
    {
        return a;
    }

    public final Object getValue()
    {
        return b;
    }

    public final Object setValue(Object obj)
    {
        throw new UnsupportedOperationException();
    }
}
