// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

import android.util.Log;
import android.view.MenuItem;
import android.view.View;

public final class aw
{
    static final class a
        implements d
    {

        public final MenuItem a(MenuItem menuitem, View view)
        {
            return menuitem;
        }

        public final View a(MenuItem menuitem)
        {
            return null;
        }

        public final void a(MenuItem menuitem, int i)
        {
        }

        public final MenuItem b(MenuItem menuitem, int i)
        {
            return menuitem;
        }

        public final boolean b(MenuItem menuitem)
        {
            return false;
        }

        public final boolean c(MenuItem menuitem)
        {
            return false;
        }

        a()
        {
        }
    }

    static class b
        implements d
    {

        public final MenuItem a(MenuItem menuitem, View view)
        {
            return menuitem.setActionView(view);
        }

        public final View a(MenuItem menuitem)
        {
            return menuitem.getActionView();
        }

        public final void a(MenuItem menuitem, int i)
        {
            menuitem.setShowAsAction(i);
        }

        public final MenuItem b(MenuItem menuitem, int i)
        {
            return menuitem.setActionView(i);
        }

        public boolean b(MenuItem menuitem)
        {
            return false;
        }

        public boolean c(MenuItem menuitem)
        {
            return false;
        }

        b()
        {
        }
    }

    static final class c extends b
    {

        public final boolean b(MenuItem menuitem)
        {
            return menuitem.expandActionView();
        }

        public final boolean c(MenuItem menuitem)
        {
            return menuitem.isActionViewExpanded();
        }

        c()
        {
        }
    }

    static interface d
    {

        public abstract MenuItem a(MenuItem menuitem, View view);

        public abstract View a(MenuItem menuitem);

        public abstract void a(MenuItem menuitem, int i);

        public abstract MenuItem b(MenuItem menuitem, int i);

        public abstract boolean b(MenuItem menuitem);

        public abstract boolean c(MenuItem menuitem);
    }

    public static interface e
    {

        public abstract boolean a(MenuItem menuitem);

        public abstract boolean b(MenuItem menuitem);
    }


    static final d a;

    public static MenuItem a(MenuItem menuitem, View view)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).setActionView(view);
        } else
        {
            return a.a(menuitem, view);
        }
    }

    public static MenuItem a(MenuItem menuitem, ao ao)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).a(ao);
        } else
        {
            Log.w("MenuItemCompat", "setActionProvider: item does not implement SupportMenuItem; ignoring");
            return menuitem;
        }
    }

    public static View a(MenuItem menuitem)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).getActionView();
        } else
        {
            return a.a(menuitem);
        }
    }

    public static void a(MenuItem menuitem, int i)
    {
        if (menuitem instanceof q)
        {
            ((q)menuitem).setShowAsAction(i);
            return;
        } else
        {
            a.a(menuitem, i);
            return;
        }
    }

    public static MenuItem b(MenuItem menuitem, int i)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).setActionView(i);
        } else
        {
            return a.b(menuitem, i);
        }
    }

    public static boolean b(MenuItem menuitem)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).expandActionView();
        } else
        {
            return a.b(menuitem);
        }
    }

    public static boolean c(MenuItem menuitem)
    {
        if (menuitem instanceof q)
        {
            return ((q)menuitem).isActionViewExpanded();
        } else
        {
            return a.c(menuitem);
        }
    }

    static 
    {
        int i = android.os.Build.VERSION.SDK_INT;
        if (i >= 14)
        {
            a = new c();
        } else
        if (i >= 11)
        {
            a = new b();
        } else
        {
            a = new a();
        }
    }
}
