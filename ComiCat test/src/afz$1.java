// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import android.view.View;
import android.view.inputmethod.InputMethodManager;
import meanlabs.comicreader.ReaderActivity;

final class ang.Object
    implements android.view.nFocusChangeListener
{

    final afz a;

    public final void onFocusChange(View view, boolean flag)
    {
        if (flag)
        {
            view = (InputMethodManager)a.a.getSystemService("input_method");
            if (view != null)
            {
                view.toggleSoftInput(1, 1);
            }
        }
    }

    (afz afz1)
    {
        a = afz1;
        super();
    }
}
