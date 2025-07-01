// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package android.support.design.widget;

import al;
import android.content.Context;
import android.content.res.ColorStateList;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.os.Handler;
import android.os.Message;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;
import android.view.accessibility.AccessibilityEvent;
import android.view.animation.AccelerateInterpolator;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import bh;
import bp;
import bu;
import bz;
import java.util.List;

// Referenced classes of package android.support.design.widget:
//            CollapsingTextHelper, AnimationUtils, ViewUtils, ValueAnimatorCompat

public class TextInputLayout extends LinearLayout
{
    class TextInputAccessibilityDelegate extends al
    {

        final TextInputLayout this$0;

        public void onInitializeAccessibilityEvent(View view, AccessibilityEvent accessibilityevent)
        {
            super.onInitializeAccessibilityEvent(view, accessibilityevent);
            accessibilityevent.setClassName(android/support/design/widget/TextInputLayout.getSimpleName());
        }

        public void onInitializeAccessibilityNodeInfo(View view, bz bz1)
        {
            super.onInitializeAccessibilityNodeInfo(view, bz1);
            bz1.b(android/support/design/widget/TextInputLayout.getSimpleName());
            view = mCollapsingTextHelper.getText();
            if (!TextUtils.isEmpty(view))
            {
                bz.a.e(bz1.b, view);
            }
            if (mEditText != null)
            {
                view = mEditText;
                bz.a.a(bz1.b, view);
            }
            if (mErrorView != null)
            {
                view = mErrorView.getText();
            } else
            {
                view = null;
            }
            if (!TextUtils.isEmpty(view))
            {
                bz.a.v(bz1.b);
                bz.a.a(bz1.b, view);
            }
        }

        public void onPopulateAccessibilityEvent(View view, AccessibilityEvent accessibilityevent)
        {
            super.onPopulateAccessibilityEvent(view, accessibilityevent);
            view = mCollapsingTextHelper.getText();
            if (!TextUtils.isEmpty(view))
            {
                accessibilityevent.getText().add(view);
            }
        }

        private TextInputAccessibilityDelegate()
        {
            this$0 = TextInputLayout.this;
            super();
        }

    }


    private static final int ANIMATION_DURATION = 200;
    private static final int MSG_UPDATE_LABEL = 0;
    private ValueAnimatorCompat mAnimator;
    private final CollapsingTextHelper mCollapsingTextHelper;
    private int mDefaultTextColor;
    private EditText mEditText;
    private boolean mErrorEnabled;
    private int mErrorTextAppearance;
    private TextView mErrorView;
    private int mFocusedTextColor;
    private final Handler mHandler;
    private CharSequence mHint;

    public TextInputLayout(Context context)
    {
        this(context, null);
    }

    public TextInputLayout(Context context, AttributeSet attributeset)
    {
        super(context, attributeset);
        setOrientation(1);
        setWillNotDraw(false);
        mCollapsingTextHelper = new CollapsingTextHelper(this);
        mHandler = new Handler(new android.os.Handler.Callback() {

            final TextInputLayout this$0;

            public boolean handleMessage(Message message)
            {
                switch (message.what)
                {
                default:
                    return false;

                case 0: // '\0'
                    updateLabelVisibility(true);
                    break;
                }
                return true;
            }

            
            {
                this$0 = TextInputLayout.this;
                super();
            }
        });
        mCollapsingTextHelper.setTextSizeInterpolator(AnimationUtils.FAST_OUT_SLOW_IN_INTERPOLATOR);
        mCollapsingTextHelper.setPositionInterpolator(new AccelerateInterpolator());
        mCollapsingTextHelper.setCollapsedTextVerticalGravity(48);
        context = context.obtainStyledAttributes(attributeset, a.h.TextInputLayout, 0, a.g.Widget_Design_TextInputLayout);
        mHint = context.getText(a.h.TextInputLayout_android_hint);
        int i = context.getResourceId(a.h.TextInputLayout_hintTextAppearance, -1);
        if (i != -1)
        {
            mCollapsingTextHelper.setCollapsedTextAppearance(i);
        }
        mErrorTextAppearance = context.getResourceId(a.h.TextInputLayout_errorTextAppearance, 0);
        boolean flag = context.getBoolean(a.h.TextInputLayout_errorEnabled, false);
        mDefaultTextColor = getThemeAttrColor(0x101009a);
        mFocusedTextColor = mCollapsingTextHelper.getCollapsedTextColor();
        mCollapsingTextHelper.setCollapsedTextColor(mDefaultTextColor);
        mCollapsingTextHelper.setExpandedTextColor(mDefaultTextColor);
        context.recycle();
        if (flag)
        {
            setErrorEnabled(true);
        }
        if (bh.e(this) == 0)
        {
            bh.c(this, 1);
        }
        bh.a(this, new TextInputAccessibilityDelegate());
    }

    private void animateToExpansionFraction(float f)
    {
        if (mAnimator != null) goto _L2; else goto _L1
_L1:
        mAnimator = ViewUtils.createAnimator();
        mAnimator.setInterpolator(AnimationUtils.LINEAR_INTERPOLATOR);
        mAnimator.setDuration(200);
        mAnimator.setUpdateListener(new ValueAnimatorCompat.AnimatorUpdateListener() {

            final TextInputLayout this$0;

            public void onAnimationUpdate(ValueAnimatorCompat valueanimatorcompat)
            {
                mCollapsingTextHelper.setExpansionFraction(valueanimatorcompat.getAnimatedFloatValue());
            }

            
            {
                this$0 = TextInputLayout.this;
                super();
            }
        });
_L4:
        mAnimator.setFloatValues(mCollapsingTextHelper.getExpansionFraction(), f);
        mAnimator.start();
        return;
_L2:
        if (mAnimator.isRunning())
        {
            mAnimator.cancel();
        }
        if (true) goto _L4; else goto _L3
_L3:
    }

    private void collapseHint(boolean flag)
    {
        if (flag)
        {
            animateToExpansionFraction(1.0F);
            return;
        } else
        {
            mCollapsingTextHelper.setExpansionFraction(1.0F);
            return;
        }
    }

    private void expandHint(boolean flag)
    {
        if (flag)
        {
            animateToExpansionFraction(0.0F);
            return;
        } else
        {
            mCollapsingTextHelper.setExpansionFraction(0.0F);
            return;
        }
    }

    private int getThemeAttrColor(int i)
    {
        TypedValue typedvalue = new TypedValue();
        if (getContext().getTheme().resolveAttribute(i, typedvalue, true))
        {
            return typedvalue.data;
        } else
        {
            return -65281;
        }
    }

    private android.widget.LinearLayout.LayoutParams setEditText(EditText edittext, android.view.ViewGroup.LayoutParams layoutparams)
    {
        if (mEditText != null)
        {
            throw new IllegalArgumentException("We already have an EditText, can only have one");
        }
        mEditText = edittext;
        mCollapsingTextHelper.setExpandedTextSize(mEditText.getTextSize());
        mEditText.addTextChangedListener(new TextWatcher() {

            final TextInputLayout this$0;

            public void afterTextChanged(Editable editable)
            {
                mHandler.sendEmptyMessage(0);
            }

            public void beforeTextChanged(CharSequence charsequence, int i, int j, int k)
            {
            }

            public void onTextChanged(CharSequence charsequence, int i, int j, int k)
            {
            }

            
            {
                this$0 = TextInputLayout.this;
                super();
            }
        });
        mDefaultTextColor = mEditText.getHintTextColors().getDefaultColor();
        mEditText.setOnFocusChangeListener(new android.view.View.OnFocusChangeListener() {

            final TextInputLayout this$0;

            public void onFocusChange(View view, boolean flag)
            {
                mHandler.sendEmptyMessage(0);
            }

            
            {
                this$0 = TextInputLayout.this;
                super();
            }
        });
        if (TextUtils.isEmpty(mHint))
        {
            setHint(mEditText.getHint());
            mEditText.setHint(null);
        }
        if (mErrorView != null)
        {
            bh.b(mErrorView, bh.m(mEditText), 0, bh.n(mEditText), mEditText.getPaddingBottom());
        }
        updateLabelVisibility(false);
        edittext = new android.widget.LinearLayout.LayoutParams(layoutparams);
        layoutparams = new Paint();
        layoutparams.setTextSize(mCollapsingTextHelper.getExpandedTextSize());
        edittext.topMargin = (int)(-layoutparams.ascent());
        return edittext;
    }

    private void updateLabelVisibility(boolean flag)
    {
        CollapsingTextHelper collapsingtexthelper;
        boolean flag1;
        int i;
        boolean flag2;
        if (!TextUtils.isEmpty(mEditText.getText()))
        {
            flag1 = true;
        } else
        {
            flag1 = false;
        }
        flag2 = mEditText.isFocused();
        mCollapsingTextHelper.setExpandedTextColor(mDefaultTextColor);
        collapsingtexthelper = mCollapsingTextHelper;
        if (flag2)
        {
            i = mFocusedTextColor;
        } else
        {
            i = mDefaultTextColor;
        }
        collapsingtexthelper.setCollapsedTextColor(i);
        if (flag1 || flag2)
        {
            collapseHint(flag);
            return;
        } else
        {
            expandHint(flag);
            return;
        }
    }

    public void addView(View view, int i, android.view.ViewGroup.LayoutParams layoutparams)
    {
        if (view instanceof EditText)
        {
            super.addView(view, 0, setEditText((EditText)view, layoutparams));
            return;
        } else
        {
            super.addView(view, i, layoutparams);
            return;
        }
    }

    public void draw(Canvas canvas)
    {
        super.draw(canvas);
        mCollapsingTextHelper.draw(canvas);
    }

    public EditText getEditText()
    {
        return mEditText;
    }

    protected void onLayout(boolean flag, int i, int j, int k, int l)
    {
        super.onLayout(flag, i, j, k, l);
        if (mEditText != null)
        {
            i = mEditText.getLeft() + mEditText.getCompoundPaddingLeft();
            k = mEditText.getRight() - mEditText.getCompoundPaddingRight();
            mCollapsingTextHelper.setExpandedBounds(i, mEditText.getTop() + mEditText.getCompoundPaddingTop(), k, mEditText.getBottom() - mEditText.getCompoundPaddingBottom());
            mCollapsingTextHelper.setCollapsedBounds(i, getPaddingTop(), k, l - j - getPaddingBottom());
            mCollapsingTextHelper.recalculate();
        }
    }

    public void setError(CharSequence charsequence)
    {
        if (!mErrorEnabled)
        {
            if (TextUtils.isEmpty(charsequence))
            {
                return;
            }
            setErrorEnabled(true);
        }
        if (TextUtils.isEmpty(charsequence)) goto _L2; else goto _L1
_L1:
        mErrorView.setText(charsequence);
        mErrorView.setVisibility(0);
        bh.c(mErrorView, 0.0F);
        bh.s(mErrorView).a(1.0F).a(200L).a(AnimationUtils.FAST_OUT_SLOW_IN_INTERPOLATOR).a(null).b();
_L4:
        sendAccessibilityEvent(2048);
        return;
_L2:
        if (mErrorView.getVisibility() == 0)
        {
            bh.s(mErrorView).a(0.0F).a(200L).a(AnimationUtils.FAST_OUT_SLOW_IN_INTERPOLATOR).a(new bu() {

                final TextInputLayout this$0;

                public void onAnimationEnd(View view)
                {
                    mErrorView.setText(null);
                    mErrorView.setVisibility(4);
                }

            
            {
                this$0 = TextInputLayout.this;
                super();
            }
            }).b();
        }
        if (true) goto _L4; else goto _L3
_L3:
    }

    public void setErrorEnabled(boolean flag)
    {
        if (mErrorEnabled != flag)
        {
            if (flag)
            {
                mErrorView = new TextView(getContext());
                mErrorView.setTextAppearance(getContext(), mErrorTextAppearance);
                mErrorView.setVisibility(4);
                addView(mErrorView);
                if (mEditText != null)
                {
                    bh.b(mErrorView, bh.m(mEditText), 0, bh.n(mEditText), mEditText.getPaddingBottom());
                }
            } else
            {
                removeView(mErrorView);
                mErrorView = null;
            }
            mErrorEnabled = flag;
        }
    }

    public void setHint(CharSequence charsequence)
    {
        mHint = charsequence;
        mCollapsingTextHelper.setText(charsequence);
        sendAccessibilityEvent(2048);
    }





}
