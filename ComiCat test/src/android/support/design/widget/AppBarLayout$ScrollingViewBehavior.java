// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package android.support.design.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.View;
import bh;
import java.util.List;

// Referenced classes of package android.support.design.widget:
//            ViewOffsetBehavior, AppBarLayout, CoordinatorLayout, AnimationUtils

public static class mOverlayTop extends ViewOffsetBehavior
{

    private int mOverlayTop;

    private static AppBarLayout findFirstAppBarLayout(List list)
    {
        int j = list.size();
        for (int i = 0; i < j; i++)
        {
            View view = (View)list.get(i);
            if (view instanceof AppBarLayout)
            {
                return (AppBarLayout)view;
            }
        }

        return null;
    }

    public volatile int getLeftAndRightOffset()
    {
        return super.getLeftAndRightOffset();
    }

    public int getOverlayTop()
    {
        return mOverlayTop;
    }

    public volatile int getTopAndBottomOffset()
    {
        return super.getTopAndBottomOffset();
    }

    public boolean layoutDependsOn(CoordinatorLayout coordinatorlayout, View view, View view1)
    {
        return view1 instanceof AppBarLayout;
    }

    public boolean onDependentViewChanged(CoordinatorLayout coordinatorlayout, View view, View view1)
    {
        ffset ffset = ((ffset)view1.getLayoutParams()).ehavior();
        if (ffset instanceof ehavior)
        {
            int i = ((ehavior)ffset).ffsetForScrollingSibling();
            int j = view1.getHeight();
            int k = mOverlayTop;
            int l = coordinatorlayout.getHeight();
            int i1 = view.getHeight();
            if (mOverlayTop != 0 && (view1 instanceof AppBarLayout))
            {
                int j1 = ((AppBarLayout)view1).getTotalScrollRange();
                setTopAndBottomOffset(AnimationUtils.lerp(j - k, l - i1, (float)Math.abs(i) / (float)j1));
            } else
            {
                setTopAndBottomOffset(i + (view1.getHeight() - mOverlayTop));
            }
        }
        return false;
    }

    public volatile boolean onLayoutChild(CoordinatorLayout coordinatorlayout, View view, int i)
    {
        return super.onLayoutChild(coordinatorlayout, view, i);
    }

    public boolean onMeasureChild(CoordinatorLayout coordinatorlayout, View view, int i, int j, int k, int l)
    {
        if (view.getLayoutParams().lingViewBehavior == -1)
        {
            Object obj = coordinatorlayout.getDependencies(view);
            if (!((List) (obj)).isEmpty())
            {
                if ((obj = findFirstAppBarLayout(((List) (obj)))) != null && bh.C(((View) (obj))))
                {
                    if (bh.x(((View) (obj))))
                    {
                        bh.a(view, true);
                    }
                    int i1 = android.view.lingViewBehavior.findFirstAppBarLayout(k);
                    k = i1;
                    if (i1 == 0)
                    {
                        k = coordinatorlayout.getHeight();
                    }
                    coordinatorlayout.onMeasureChild(view, i, j, android.view.onMeasureChild((k - ((AppBarLayout) (obj)).getMeasuredHeight()) + ((AppBarLayout) (obj)).getTotalScrollRange(), 0x80000000), l);
                    return true;
                }
            }
        }
        return false;
    }

    public volatile boolean setLeftAndRightOffset(int i)
    {
        return super.setLeftAndRightOffset(i);
    }

    public void setOverlayTop(int i)
    {
        mOverlayTop = i;
    }

    public volatile boolean setTopAndBottomOffset(int i)
    {
        return super.setTopAndBottomOffset(i);
    }

    public ()
    {
    }

    public (Context context, AttributeSet attributeset)
    {
        super(context, attributeset);
        context = context.obtainStyledAttributes(attributeset, dAttributes);
        mOverlayTop = context.getDimensionPixelSize(havior_overlapTop, 0);
        context.recycle();
    }
}
