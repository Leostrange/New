// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package meanlabs.comicreader;

import android.content.DialogInterface;

// Referenced classes of package meanlabs.comicreader:
//            CatalogSettings

final class a
    implements android.content.ClickListener
{

    final CatalogSettings a;

    public final void onClick(DialogInterface dialoginterface, int i)
    {
        dialoginterface.dismiss();
    }

    Listener(CatalogSettings catalogsettings)
    {
        a = catalogsettings;
        super();
    }
}
