// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.text.method.SingleLineTransformationMethod;
import android.view.View;
import java.util.Locale;

final class be
{
    public static final class a extends SingleLineTransformationMethod
    {

        private Locale a;

        public final CharSequence getTransformation(CharSequence charsequence, View view)
        {
            charsequence = super.getTransformation(charsequence, view);
            if (charsequence != null)
            {
                return charsequence.toString().toUpperCase(a);
            } else
            {
                return null;
            }
        }

        public a(Context context)
        {
            a = context.getResources().getConfiguration().locale;
        }
    }

}
