// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;

public final class es
{

    public final TypedArray a;
    private final Context b;
    private er c;

    private es(Context context, TypedArray typedarray)
    {
        b = context;
        a = typedarray;
    }

    public static es a(Context context, AttributeSet attributeset, int ai[])
    {
        return new es(context, context.obtainStyledAttributes(attributeset, ai));
    }

    public static es a(Context context, AttributeSet attributeset, int ai[], int i)
    {
        return new es(context, context.obtainStyledAttributes(attributeset, ai, i, 0));
    }

    public final int a(int i, int j)
    {
        return a.getInt(i, j);
    }

    public final Drawable a(int i)
    {
        if (a.hasValue(i))
        {
            int j = a.getResourceId(i, 0);
            if (j != 0)
            {
                return a().a(j, false);
            }
        }
        return a.getDrawable(i);
    }

    public final er a()
    {
        if (c == null)
        {
            c = er.a(b);
        }
        return c;
    }

    public final boolean a(int i, boolean flag)
    {
        return a.getBoolean(i, flag);
    }

    public final int b(int i, int j)
    {
        return a.getDimensionPixelOffset(i, j);
    }

    public final Drawable b(int i)
    {
        if (a.hasValue(i))
        {
            i = a.getResourceId(i, 0);
            if (i != 0)
            {
                return a().a(i, true);
            }
        }
        return null;
    }

    public final int c(int i, int j)
    {
        return a.getDimensionPixelSize(i, j);
    }

    public final CharSequence c(int i)
    {
        return a.getText(i);
    }

    public final int d(int i, int j)
    {
        return a.getLayoutDimension(i, j);
    }

    public final boolean d(int i)
    {
        return a.hasValue(i);
    }

    public final int e(int i, int j)
    {
        return a.getResourceId(i, j);
    }
}
