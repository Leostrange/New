// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package android.support.v7.internal.widget;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.view.View;
import android.widget.AbsListView;
import android.widget.ListAdapter;
import android.widget.ListView;
import cz;
import java.lang.reflect.Field;

public class ListViewCompat extends ListView
{
    static final class a extends cz
    {

        boolean a;

        public final void draw(Canvas canvas)
        {
            if (a)
            {
                super.draw(canvas);
            }
        }

        public final void setHotspot(float f1, float f2)
        {
            if (a)
            {
                super.setHotspot(f1, f2);
            }
        }

        public final void setHotspotBounds(int i, int j, int k, int l)
        {
            if (a)
            {
                super.setHotspotBounds(i, j, k, l);
            }
        }

        public final boolean setState(int ai[])
        {
            if (a)
            {
                return super.setState(ai);
            } else
            {
                return false;
            }
        }

        public final boolean setVisible(boolean flag, boolean flag1)
        {
            if (a)
            {
                return super.setVisible(flag, flag1);
            } else
            {
                return false;
            }
        }

        public a(Drawable drawable)
        {
            super(drawable);
            a = true;
        }
    }


    private static final int g[] = {
        0
    };
    protected final Rect a;
    protected int b;
    protected int c;
    protected int d;
    protected int e;
    protected Field f;
    private a h;

    public ListViewCompat(Context context)
    {
        this(context, null);
    }

    public ListViewCompat(Context context, AttributeSet attributeset)
    {
        this(context, attributeset, 0);
    }

    public ListViewCompat(Context context, AttributeSet attributeset, int i)
    {
        super(context, attributeset, i);
        a = new Rect();
        b = 0;
        c = 0;
        d = 0;
        e = 0;
        try
        {
            f = android/widget/AbsListView.getDeclaredField("mIsChildViewEnabled");
            f.setAccessible(true);
            return;
        }
        // Misplaced declaration of an exception variable
        catch (Context context)
        {
            context.printStackTrace();
        }
    }

    public final int a(int i, int j)
    {
        Object obj;
        ListAdapter listadapter;
        int k;
        int l;
        int i1;
        k = getListPaddingTop();
        i1 = getListPaddingBottom();
        getListPaddingLeft();
        getListPaddingRight();
        l = getDividerHeight();
        obj = getDivider();
        listadapter = getAdapter();
        if (listadapter != null) goto _L2; else goto _L1
_L1:
        k += i1;
_L4:
        return k;
_L2:
        k = i1 + k;
        int j1;
        int l1;
        if (l <= 0 || obj == null)
        {
            l = 0;
        }
        l1 = listadapter.getCount();
        i1 = 0;
        j1 = 0;
        obj = null;
        do
        {
label0:
            {
                if (i1 >= l1)
                {
                    break label0;
                }
                int k1 = listadapter.getItemViewType(i1);
                if (k1 != j1)
                {
                    j1 = k1;
                    obj = null;
                }
                obj = listadapter.getView(i1, ((View) (obj)), this);
                android.view.ViewGroup.LayoutParams layoutparams = ((View) (obj)).getLayoutParams();
                if (layoutparams != null && layoutparams.height > 0)
                {
                    k1 = android.view.View.MeasureSpec.makeMeasureSpec(layoutparams.height, 0x40000000);
                } else
                {
                    k1 = android.view.View.MeasureSpec.makeMeasureSpec(0, 0);
                }
                ((View) (obj)).measure(i, k1);
                if (i1 > 0)
                {
                    k += l;
                }
                k1 = ((View) (obj)).getMeasuredHeight() + k;
                k = j;
                if (k1 >= j)
                {
                    continue; /* Loop/switch isn't completed */
                }
                i1++;
                k = k1;
            }
        } while (true);
        if (true) goto _L4; else goto _L3
_L3:
        return k;
    }

    public boolean a()
    {
        return false;
    }

    protected void dispatchDraw(Canvas canvas)
    {
        if (!a.isEmpty())
        {
            Drawable drawable = getSelector();
            if (drawable != null)
            {
                drawable.setBounds(a);
                drawable.draw(canvas);
            }
        }
        super.dispatchDraw(canvas);
    }

    protected void drawableStateChanged()
    {
        boolean flag = true;
        super.drawableStateChanged();
        setSelectorEnabled(true);
        Drawable drawable = getSelector();
        if (drawable != null)
        {
            if (!a() || !isPressed())
            {
                flag = false;
            }
            if (flag)
            {
                drawable.setState(getDrawableState());
            }
        }
    }

    public void setSelector(Drawable drawable)
    {
        Object obj;
        if (drawable != null)
        {
            obj = new a(drawable);
        } else
        {
            obj = null;
        }
        h = ((a) (obj));
        super.setSelector(h);
        obj = new Rect();
        if (drawable != null)
        {
            drawable.getPadding(((Rect) (obj)));
        }
        b = ((Rect) (obj)).left;
        c = ((Rect) (obj)).top;
        d = ((Rect) (obj)).right;
        e = ((Rect) (obj)).bottom;
    }

    protected void setSelectorEnabled(boolean flag)
    {
        if (h != null)
        {
            h.a = flag;
        }
    }

}
