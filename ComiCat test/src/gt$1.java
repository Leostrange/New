// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import java.util.concurrent.ThreadFactory;

static final class >
    implements ThreadFactory
{

    public final Thread newThread(Runnable runnable)
    {
        return new Thread(runnable, (new StringBuilder("AmazonAuthorzationLibrary#")).append(gt.b()).toString());
    }

    >()
    {
    }
}
