// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package android.support.v7.widget;

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.support.v7.internal.view.menu.ActionMenuItemView;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.view.ContextThemeWrapper;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.accessibility.AccessibilityEvent;
import do;
import ds;
import du;
import dz;
import eu;

// Referenced classes of package android.support.v7.widget:
//            LinearLayoutCompat, ActionMenuPresenter

public class ActionMenuView extends LinearLayoutCompat
    implements ds.b, dz
{
    public static class LayoutParams extends LinearLayoutCompat.LayoutParams
    {

        public boolean a;
        public int b;
        public int c;
        public boolean d;
        public boolean e;
        boolean f;

        public LayoutParams()
        {
            super(-2, -2);
            a = false;
        }

        public LayoutParams(Context context, AttributeSet attributeset)
        {
            super(context, attributeset);
        }

        public LayoutParams(LayoutParams layoutparams)
        {
            super(layoutparams);
            a = layoutparams.a;
        }

        public LayoutParams(android.view.ViewGroup.LayoutParams layoutparams)
        {
            super(layoutparams);
        }
    }

    public static interface a
    {

        public abstract boolean b();

        public abstract boolean c();
    }

    final class b
        implements dy.a
    {

        final ActionMenuView a;

        public final void onCloseMenu(ds ds1, boolean flag)
        {
        }

        public final boolean onOpenSubMenu(ds ds1)
        {
            return false;
        }

        private b()
        {
            a = ActionMenuView.this;
            super();
        }

        b(byte byte0)
        {
            this();
        }
    }

    final class c
        implements ds.a
    {

        final ActionMenuView a;

        public final boolean onMenuItemSelected(ds ds1, MenuItem menuitem)
        {
            return ActionMenuView.a(a) != null && ActionMenuView.a(a).a(menuitem);
        }

        public final void onMenuModeChange(ds ds1)
        {
            if (ActionMenuView.b(a) != null)
            {
                ActionMenuView.b(a).onMenuModeChange(ds1);
            }
        }

        private c()
        {
            a = ActionMenuView.this;
            super();
        }

        c(byte byte0)
        {
            this();
        }
    }

    public static interface d
    {

        public abstract boolean a(MenuItem menuitem);
    }


    ds a;
    public boolean b;
    public ActionMenuPresenter c;
    private Context d;
    private Context e;
    private int f;
    private dy.a g;
    private ds.a h;
    private boolean i;
    private int j;
    private int k;
    private int l;
    private d m;

    public ActionMenuView(Context context)
    {
        this(context, null);
    }

    public ActionMenuView(Context context, AttributeSet attributeset)
    {
        super(context, attributeset);
        d = context;
        setBaselineAligned(false);
        float f1 = context.getResources().getDisplayMetrics().density;
        k = (int)(56F * f1);
        l = (int)(f1 * 4F);
        e = context;
        f = 0;
    }

    static int a(View view, int i1, int j1, int k1, int l1)
    {
        boolean flag1 = false;
        LayoutParams layoutparams = (LayoutParams)view.getLayoutParams();
        int i2 = android.view.View.MeasureSpec.makeMeasureSpec(android.view.View.MeasureSpec.getSize(k1) - l1, android.view.View.MeasureSpec.getMode(k1));
        ActionMenuItemView actionmenuitemview;
        boolean flag;
        if (view instanceof ActionMenuItemView)
        {
            actionmenuitemview = (ActionMenuItemView)view;
        } else
        {
            actionmenuitemview = null;
        }
        if (actionmenuitemview != null && actionmenuitemview.a())
        {
            l1 = 1;
        } else
        {
            l1 = 0;
        }
        if (j1 > 0 && (l1 == 0 || j1 >= 2))
        {
            view.measure(android.view.View.MeasureSpec.makeMeasureSpec(i1 * j1, 0x80000000), i2);
            int j2 = view.getMeasuredWidth();
            k1 = j2 / i1;
            j1 = k1;
            if (j2 % i1 != 0)
            {
                j1 = k1 + 1;
            }
            k1 = j1;
            if (l1 != 0)
            {
                k1 = j1;
                if (j1 < 2)
                {
                    k1 = 2;
                }
            }
        } else
        {
            k1 = 0;
        }
        flag = flag1;
        if (!layoutparams.a)
        {
            flag = flag1;
            if (l1 != 0)
            {
                flag = true;
            }
        }
        layoutparams.d = flag;
        layoutparams.b = k1;
        view.measure(android.view.View.MeasureSpec.makeMeasureSpec(k1 * i1, 0x40000000), i2);
        return k1;
    }

    public static LayoutParams a()
    {
        LayoutParams layoutparams = d();
        layoutparams.a = true;
        return layoutparams;
    }

    protected static LayoutParams a(android.view.ViewGroup.LayoutParams layoutparams)
    {
        if (layoutparams != null)
        {
            if (layoutparams instanceof LayoutParams)
            {
                layoutparams = new LayoutParams((LayoutParams)layoutparams);
            } else
            {
                layoutparams = new LayoutParams(layoutparams);
            }
            if (((LayoutParams) (layoutparams)).h <= 0)
            {
                layoutparams.h = 16;
            }
            return layoutparams;
        } else
        {
            return d();
        }
    }

    static d a(ActionMenuView actionmenuview)
    {
        return actionmenuview.m;
    }

    private boolean a(int i1)
    {
        boolean flag1 = false;
        if (i1 == 0)
        {
            return false;
        }
        View view = getChildAt(i1 - 1);
        View view1 = getChildAt(i1);
        boolean flag = flag1;
        if (i1 < getChildCount())
        {
            flag = flag1;
            if (view instanceof a)
            {
                flag = ((a)view).c() | false;
            }
        }
        if (i1 > 0 && (view1 instanceof a))
        {
            return ((a)view1).b() | flag;
        } else
        {
            return flag;
        }
    }

    private LayoutParams b(AttributeSet attributeset)
    {
        return new LayoutParams(getContext(), attributeset);
    }

    static ds.a b(ActionMenuView actionmenuview)
    {
        return actionmenuview.h;
    }

    private static LayoutParams d()
    {
        LayoutParams layoutparams = new LayoutParams();
        layoutparams.h = 16;
        return layoutparams;
    }

    public final LinearLayoutCompat.LayoutParams a(AttributeSet attributeset)
    {
        return b(attributeset);
    }

    public final boolean a(du du)
    {
        return a.a(du, null, 0);
    }

    protected final LinearLayoutCompat.LayoutParams b(android.view.ViewGroup.LayoutParams layoutparams)
    {
        return a(layoutparams);
    }

    public final void b()
    {
        if (c != null)
        {
            c.f();
        }
    }

    protected final LinearLayoutCompat.LayoutParams c()
    {
        return d();
    }

    protected boolean checkLayoutParams(android.view.ViewGroup.LayoutParams layoutparams)
    {
        return layoutparams != null && (layoutparams instanceof LayoutParams);
    }

    public boolean dispatchPopulateAccessibilityEvent(AccessibilityEvent accessibilityevent)
    {
        return false;
    }

    protected android.view.ViewGroup.LayoutParams generateDefaultLayoutParams()
    {
        return d();
    }

    public android.view.ViewGroup.LayoutParams generateLayoutParams(AttributeSet attributeset)
    {
        return b(attributeset);
    }

    protected android.view.ViewGroup.LayoutParams generateLayoutParams(android.view.ViewGroup.LayoutParams layoutparams)
    {
        return a(layoutparams);
    }

    public Menu getMenu()
    {
        if (a == null)
        {
            Object obj = getContext();
            a = new ds(((Context) (obj)));
            a.a(new c((byte)0));
            c = new ActionMenuPresenter(((Context) (obj)));
            c.b();
            ActionMenuPresenter actionmenupresenter = c;
            if (g != null)
            {
                obj = g;
            } else
            {
                obj = new b((byte)0);
            }
            actionmenupresenter.f = ((dy.a) (obj));
            a.a(c, e);
            c.a(this);
        }
        return a;
    }

    public int getPopupTheme()
    {
        return f;
    }

    public int getWindowAnimations()
    {
        return 0;
    }

    public void initialize(ds ds1)
    {
        a = ds1;
    }

    public void onConfigurationChanged(Configuration configuration)
    {
        if (android.os.Build.VERSION.SDK_INT >= 8)
        {
            super.onConfigurationChanged(configuration);
        }
        if (c != null)
        {
            c.updateMenuView(false);
            if (c.h())
            {
                c.e();
                c.d();
            }
        }
    }

    public void onDetachedFromWindow()
    {
        super.onDetachedFromWindow();
        b();
    }

    protected void onLayout(boolean flag, int i1, int j1, int k1, int l1)
    {
        if (i) goto _L2; else goto _L1
_L1:
        super.onLayout(flag, i1, j1, k1, l1);
_L4:
        return;
_L2:
        int i4 = getChildCount();
        int l3 = (l1 - j1) / 2;
        int j4 = getDividerWidth();
        j1 = 0;
        l1 = k1 - i1 - getPaddingRight() - getPaddingLeft();
        int j2 = 0;
        flag = eu.a(this);
        int i2 = 0;
        while (i2 < i4) 
        {
            View view = getChildAt(i2);
            LayoutParams layoutparams1;
            if (view.getVisibility() != 8)
            {
                LayoutParams layoutparams = (LayoutParams)view.getLayoutParams();
                if (layoutparams.a)
                {
                    int k2 = view.getMeasuredWidth();
                    j2 = k2;
                    if (a(i2))
                    {
                        j2 = k2 + j4;
                    }
                    int k4 = view.getMeasuredHeight();
                    int j3;
                    int l4;
                    if (flag)
                    {
                        k2 = getPaddingLeft();
                        k2 = layoutparams.leftMargin + k2;
                        j3 = k2 + j2;
                    } else
                    {
                        j3 = getWidth() - getPaddingRight() - layoutparams.rightMargin;
                        k2 = j3 - j2;
                    }
                    l4 = l3 - k4 / 2;
                    view.layout(k2, l4, j3, k4 + l4);
                    k2 = l1 - j2;
                    j2 = 1;
                    l1 = j1;
                    j1 = k2;
                } else
                {
                    int l2 = view.getMeasuredWidth();
                    int k3 = layoutparams.leftMargin;
                    l1 -= layoutparams.rightMargin + (l2 + k3);
                    a(i2);
                    l2 = j1 + 1;
                    j1 = l1;
                    l1 = l2;
                }
            } else
            {
                int i3 = j1;
                j1 = l1;
                l1 = i3;
            }
            k2 = i2 + 1;
            i2 = l1;
            l1 = j1;
            j1 = i2;
            i2 = k2;
        }
        if (i4 == 1 && j2 == 0)
        {
            view = getChildAt(0);
            j1 = view.getMeasuredWidth();
            l1 = view.getMeasuredHeight();
            i1 = (k1 - i1) / 2 - j1 / 2;
            k1 = l3 - l1 / 2;
            view.layout(i1, k1, j1 + i1, l1 + k1);
            return;
        }
        if (j2 != 0)
        {
            i1 = 0;
        } else
        {
            i1 = 1;
        }
        i1 = j1 - i1;
        if (i1 > 0)
        {
            i1 = l1 / i1;
        } else
        {
            i1 = 0;
        }
        k1 = Math.max(0, i1);
        if (!flag)
        {
            break; /* Loop/switch isn't completed */
        }
        i1 = getWidth() - getPaddingRight();
        j1 = 0;
        while (j1 < i4) 
        {
            view = getChildAt(j1);
            layoutparams1 = (LayoutParams)view.getLayoutParams();
            if (view.getVisibility() != 8 && !layoutparams1.a)
            {
                i1 -= layoutparams1.rightMargin;
                l1 = view.getMeasuredWidth();
                i2 = view.getMeasuredHeight();
                j2 = l3 - i2 / 2;
                view.layout(i1 - l1, j2, i1, i2 + j2);
                i1 -= layoutparams1.leftMargin + l1 + k1;
            }
            j1++;
        }
        if (true) goto _L4; else goto _L3
_L3:
        i1 = getPaddingLeft();
        j1 = 0;
        while (j1 < i4) 
        {
            view = getChildAt(j1);
            layoutparams1 = (LayoutParams)view.getLayoutParams();
            if (view.getVisibility() != 8 && !layoutparams1.a)
            {
                i1 += layoutparams1.leftMargin;
                l1 = view.getMeasuredWidth();
                i2 = view.getMeasuredHeight();
                j2 = l3 - i2 / 2;
                view.layout(i1, j2, i1 + l1, i2 + j2);
                i1 = layoutparams1.rightMargin + l1 + k1 + i1;
            }
            j1++;
        }
        if (true) goto _L4; else goto _L5
_L5:
    }

    protected void onMeasure(int i1, int j1)
    {
        int i2;
        boolean flag2 = i;
        int k1;
        boolean flag;
        if (android.view.View.MeasureSpec.getMode(i1) == 0x40000000)
        {
            flag = true;
        } else
        {
            flag = false;
        }
        i = flag;
        if (flag2 != i)
        {
            j = 0;
        }
        k1 = android.view.View.MeasureSpec.getSize(i1);
        if (i && a != null && k1 != j)
        {
            j = k1;
            a.b(true);
        }
        i2 = getChildCount();
        if (!i || i2 <= 0) goto _L2; else goto _L1
_L1:
        int k4 = android.view.View.MeasureSpec.getMode(j1);
        i1 = android.view.View.MeasureSpec.getSize(i1);
        int j4 = android.view.View.MeasureSpec.getSize(j1);
        k1 = getPaddingLeft();
        i2 = getPaddingRight();
        int l3 = getPaddingTop() + getPaddingBottom();
        int l4 = getChildMeasureSpec(j1, l3, -2);
        int i5 = i1 - (k1 + i2);
        i1 = i5 / k;
        j1 = k;
        if (i1 == 0)
        {
            setMeasuredDimension(i5, 0);
            return;
        }
        int j5 = k + (i5 % j1) / i1;
        j1 = 0;
        int l2 = 0;
        int k2 = 0;
        int i3 = 0;
        int j2 = 0;
        long l5 = 0L;
        int k5 = getChildCount();
        int j3 = 0;
        while (j3 < k5) 
        {
            Object obj = getChildAt(j3);
            int l1;
            if (((View) (obj)).getVisibility() != 8)
            {
                boolean flag1 = obj instanceof ActionMenuItemView;
                i3++;
                if (flag1)
                {
                    ((View) (obj)).setPadding(l, 0, l, 0);
                }
                LayoutParams layoutparams = (LayoutParams)((View) (obj)).getLayoutParams();
                layoutparams.f = false;
                layoutparams.c = 0;
                layoutparams.b = 0;
                layoutparams.d = false;
                layoutparams.leftMargin = 0;
                layoutparams.rightMargin = 0;
                int k3;
                if (flag1 && ((ActionMenuItemView)obj).a())
                {
                    flag1 = true;
                } else
                {
                    flag1 = false;
                }
                layoutparams.e = flag1;
                if (layoutparams.a)
                {
                    l1 = 1;
                } else
                {
                    l1 = i1;
                }
                k3 = a(((View) (obj)), j5, l1, l4, l3);
                l2 = Math.max(l2, k3);
                float f1;
                float f2;
                float f3;
                int i4;
                long l7;
                long l8;
                if (layoutparams.d)
                {
                    l1 = k2 + 1;
                } else
                {
                    l1 = k2;
                }
                if (layoutparams.a)
                {
                    i2 = 1;
                } else
                {
                    i2 = j2;
                }
                i1 -= k3;
                k2 = Math.max(j1, ((View) (obj)).getMeasuredHeight());
                if (k3 == 1)
                {
                    long l6 = 1 << j3;
                    j1 = k2;
                    j2 = i1;
                    k2 = l1;
                    k3 = i2;
                    l5 = l6 | l5;
                    i1 = i3;
                    i2 = j2;
                    l1 = j1;
                    j2 = k3;
                    j1 = l2;
                } else
                {
                    j1 = i3;
                    j2 = l2;
                    l2 = k2;
                    i3 = i1;
                    i1 = j1;
                    j1 = j2;
                    k2 = l1;
                    j2 = i2;
                    l1 = l2;
                    i2 = i3;
                }
            } else
            {
                l1 = j1;
                i2 = i1;
                j1 = l2;
                i1 = i3;
            }
            j3++;
            i3 = i1;
            i1 = i2;
            l2 = j1;
            j1 = l1;
        }
        if (j2 != 0 && i3 == 2)
        {
            k3 = 1;
        } else
        {
            k3 = 0;
        }
        l1 = 0;
        j3 = i1;
        i1 = l1;
        l8 = l5;
        if (k2 <= 0) goto _L4; else goto _L3
_L3:
        l8 = l5;
        if (j3 <= 0) goto _L4; else goto _L5
_L5:
        l1 = 0x7fffffff;
        l7 = 0L;
        i2 = 0;
        l3 = 0;
_L12:
        if (l3 >= k5) goto _L7; else goto _L6
_L6:
        obj = (LayoutParams)getChildAt(l3).getLayoutParams();
        if (!((LayoutParams) (obj)).d) goto _L9; else goto _L8
_L8:
        if (((LayoutParams) (obj)).b >= l1) goto _L11; else goto _L10
_L10:
        i2 = ((LayoutParams) (obj)).b;
        l7 = 1 << l3;
        l1 = 1;
_L14:
        i4 = l3 + 1;
        l3 = i2;
        i2 = l1;
        l1 = l3;
        l3 = i4;
          goto _L12
_L11:
        if (((LayoutParams) (obj)).b != l1) goto _L9; else goto _L13
_L13:
        l7 |= 1 << l3;
        i4 = i2 + 1;
        i2 = l1;
        l1 = i4;
          goto _L14
_L7:
        l5 |= l7;
        l8 = l5;
        if (i2 <= j3)
        {
            i2 = 0;
            i1 = j3;
            while (i2 < k5) 
            {
                obj = getChildAt(i2);
                layoutparams = (LayoutParams)((View) (obj)).getLayoutParams();
                if (((long)(1 << i2) & l7) == 0L)
                {
                    if (layoutparams.b == l1 + 1)
                    {
                        l5 |= 1 << i2;
                    }
                } else
                {
                    if (k3 && layoutparams.e && i1 == 1)
                    {
                        ((View) (obj)).setPadding(l + j5, 0, l, 0);
                    }
                    layoutparams.b = layoutparams.b + 1;
                    layoutparams.f = true;
                    i1--;
                }
                i2++;
            }
            l1 = 1;
            j3 = i1;
            i1 = l1;
            break MISSING_BLOCK_LABEL_541;
        }
_L4:
        if (j2 == 0 && i3 == 1)
        {
            l1 = 1;
        } else
        {
            l1 = 0;
        }
        if (j3 <= 0 || l8 == 0L || j3 >= i3 - 1 && l1 == 0 && l2 <= 1) goto _L16; else goto _L15
_L15:
        f3 = Long.bitCount(l8);
        f2 = f3;
        if (l1 != 0) goto _L18; else goto _L17
_L17:
        f1 = f3;
        if ((1L & l8) != 0L)
        {
            f1 = f3;
            if (!((LayoutParams)getChildAt(0).getLayoutParams()).e)
            {
                f1 = f3 - 0.5F;
            }
        }
        f2 = f1;
        if (((long)(1 << k5 - 1) & l8) == 0L) goto _L18; else goto _L19
_L19:
        f2 = f1;
        if (((LayoutParams)getChildAt(k5 - 1).getLayoutParams()).e) goto _L18; else goto _L20
_L20:
        f1 -= 0.5F;
_L22:
        if (f1 > 0.0F)
        {
            l1 = (int)((float)(j3 * j5) / f1);
        } else
        {
            l1 = 0;
        }
        i2 = 0;
        do
        {
            j2 = i1;
            if (i2 >= k5)
            {
                break;
            }
            if (((long)(1 << i2) & l8) != 0L)
            {
                obj = getChildAt(i2);
                layoutparams = (LayoutParams)((View) (obj)).getLayoutParams();
                if (obj instanceof ActionMenuItemView)
                {
                    layoutparams.c = l1;
                    layoutparams.f = true;
                    if (i2 == 0 && !layoutparams.e)
                    {
                        layoutparams.leftMargin = -l1 / 2;
                    }
                    i1 = 1;
                } else
                if (layoutparams.a)
                {
                    layoutparams.c = l1;
                    layoutparams.f = true;
                    layoutparams.rightMargin = -l1 / 2;
                    i1 = 1;
                } else
                {
                    if (i2 != 0)
                    {
                        layoutparams.leftMargin = l1 / 2;
                    }
                    if (i2 != k5 - 1)
                    {
                        layoutparams.rightMargin = l1 / 2;
                    }
                }
            }
            i2++;
        } while (true);
          goto _L21
_L16:
        j2 = i1;
_L21:
        if (j2 != 0)
        {
            for (i1 = 0; i1 < k5; i1++)
            {
                obj = getChildAt(i1);
                layoutparams = (LayoutParams)((View) (obj)).getLayoutParams();
                if (layoutparams.f)
                {
                    l1 = layoutparams.b;
                    ((View) (obj)).measure(android.view.View.MeasureSpec.makeMeasureSpec(layoutparams.c + l1 * j5, 0x40000000), l4);
                }
            }

        }
        if (k4 == 0x40000000)
        {
            j1 = j4;
        }
        setMeasuredDimension(i5, j1);
        return;
_L2:
        for (l1 = 0; l1 < i2; l1++)
        {
            obj = (LayoutParams)getChildAt(l1).getLayoutParams();
            obj.rightMargin = 0;
            obj.leftMargin = 0;
        }

        super.onMeasure(i1, j1);
        return;
_L18:
        f1 = f2;
        if (true) goto _L22; else goto _L9
_L9:
        i4 = l1;
        l1 = i2;
        i2 = i4;
          goto _L14
    }

    public void setExpandedActionViewsExclusive(boolean flag)
    {
        c.j = flag;
    }

    public void setMenuCallbacks(dy.a a1, ds.a a2)
    {
        g = a1;
        h = a2;
    }

    public void setOnMenuItemClickListener(d d1)
    {
        m = d1;
    }

    public void setOverflowReserved(boolean flag)
    {
        b = flag;
    }

    public void setPopupTheme(int i1)
    {
label0:
        {
            if (f != i1)
            {
                f = i1;
                if (i1 != 0)
                {
                    break label0;
                }
                e = d;
            }
            return;
        }
        e = new ContextThemeWrapper(d, i1);
    }

    public void setPresenter(ActionMenuPresenter actionmenupresenter)
    {
        c = actionmenupresenter;
        c.a(this);
    }
}
