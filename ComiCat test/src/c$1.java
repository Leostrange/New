// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import java.io.File;
import java.io.FileFilter;

static final class .lang.Object
    implements FileFilter
{

    final String a;

    public final boolean accept(File file)
    {
        return !file.getName().startsWith(a);
    }

    t>(String s)
    {
        a = s;
        super();
    }
}
