// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 


public final class ajq extends ajm
{

    final int c[];
    final int d;

    ajq(String s, int i, int ai[], int j)
    {
        super(s, i);
        if (j < 3)
        {
            throw new IllegalArgumentException("Qlen must >= 3");
        } else
        {
            c = ai;
            d = j;
            return;
        }
    }

    public final boolean a(int i)
    {
        return false;
    }

    public final boolean a(int i, int j)
    {
        return false;
    }

    public final boolean a(int ai[], int i)
    {
        if (i == d) goto _L2; else goto _L1
_L1:
        return false;
_L2:
        int j = 0;
label0:
        do
        {
label1:
            {
                if (j >= i)
                {
                    break label1;
                }
                if (ai[j] != c[j])
                {
                    break label0;
                }
                j++;
            }
        } while (true);
        if (true) goto _L1; else goto _L3
_L3:
        return true;
    }
}
