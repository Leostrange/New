// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: braces fieldsfirst space lnc 

package com.fasterxml.jackson.core;

import com.fasterxml.jackson.core.io.CharacterEscapes;
import com.fasterxml.jackson.core.io.IOContext;
import com.fasterxml.jackson.core.io.InputDecorator;
import com.fasterxml.jackson.core.io.OutputDecorator;
import com.fasterxml.jackson.core.io.UTF8Writer;
import com.fasterxml.jackson.core.json.ByteSourceJsonBootstrapper;
import com.fasterxml.jackson.core.json.ReaderBasedJsonParser;
import com.fasterxml.jackson.core.json.UTF8JsonGenerator;
import com.fasterxml.jackson.core.json.WriterBasedJsonGenerator;
import com.fasterxml.jackson.core.sym.ByteQuadsCanonicalizer;
import com.fasterxml.jackson.core.sym.CharsToNameCanonicalizer;
import com.fasterxml.jackson.core.util.BufferRecycler;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Serializable;
import java.io.StringReader;
import java.io.Writer;
import java.lang.ref.SoftReference;

// Referenced classes of package com.fasterxml.jackson.core:
//            JsonEncoding, SerializableString, ObjectCodec, JsonGenerator, 
//            JsonParser

public class JsonFactory
    implements Serializable
{
    public static final class Feature extends Enum
    {

        private static final Feature $VALUES[];
        public static final Feature CANONICALIZE_FIELD_NAMES;
        public static final Feature FAIL_ON_SYMBOL_HASH_OVERFLOW;
        public static final Feature INTERN_FIELD_NAMES;
        public static final Feature USE_THREAD_LOCAL_FOR_BUFFER_RECYCLING;
        private final boolean _defaultState;

        public static int collectDefaults()
        {
            int j = 0;
            Feature afeature[] = values();
            int l = afeature.length;
            for (int i = 0; i < l;)
            {
                Feature feature = afeature[i];
                int k = j;
                if (feature.enabledByDefault())
                {
                    k = j | feature.getMask();
                }
                i++;
                j = k;
            }

            return j;
        }

        public static Feature valueOf(String s)
        {
            return (Feature)Enum.valueOf(com/fasterxml/jackson/core/JsonFactory$Feature, s);
        }

        public static Feature[] values()
        {
            return (Feature[])$VALUES.clone();
        }

        public final boolean enabledByDefault()
        {
            return _defaultState;
        }

        public final boolean enabledIn(int i)
        {
            return (getMask() & i) != 0;
        }

        public final int getMask()
        {
            return 1 << ordinal();
        }

        static 
        {
            INTERN_FIELD_NAMES = new Feature("INTERN_FIELD_NAMES", 0, true);
            CANONICALIZE_FIELD_NAMES = new Feature("CANONICALIZE_FIELD_NAMES", 1, true);
            FAIL_ON_SYMBOL_HASH_OVERFLOW = new Feature("FAIL_ON_SYMBOL_HASH_OVERFLOW", 2, true);
            USE_THREAD_LOCAL_FOR_BUFFER_RECYCLING = new Feature("USE_THREAD_LOCAL_FOR_BUFFER_RECYCLING", 3, true);
            $VALUES = (new Feature[] {
                INTERN_FIELD_NAMES, CANONICALIZE_FIELD_NAMES, FAIL_ON_SYMBOL_HASH_OVERFLOW, USE_THREAD_LOCAL_FOR_BUFFER_RECYCLING
            });
        }

        private Feature(String s, int i, boolean flag)
        {
            super(s, i);
            _defaultState = flag;
        }
    }


    protected static final int DEFAULT_FACTORY_FEATURE_FLAGS = Feature.collectDefaults();
    protected static final int DEFAULT_GENERATOR_FEATURE_FLAGS = JsonGenerator.Feature.collectDefaults();
    protected static final int DEFAULT_PARSER_FEATURE_FLAGS = JsonParser.Feature.collectDefaults();
    private static final SerializableString DEFAULT_ROOT_VALUE_SEPARATOR;
    protected static final ThreadLocal _recyclerRef = new ThreadLocal();
    protected final transient ByteQuadsCanonicalizer _byteSymbolCanonicalizer;
    protected CharacterEscapes _characterEscapes;
    protected int _factoryFeatures;
    protected int _generatorFeatures;
    protected InputDecorator _inputDecorator;
    protected ObjectCodec _objectCodec;
    protected OutputDecorator _outputDecorator;
    protected int _parserFeatures;
    protected final transient CharsToNameCanonicalizer _rootCharSymbols;
    protected SerializableString _rootValueSeparator;

    public JsonFactory()
    {
        this(null);
    }

    public JsonFactory(ObjectCodec objectcodec)
    {
        _rootCharSymbols = CharsToNameCanonicalizer.createRoot();
        _byteSymbolCanonicalizer = ByteQuadsCanonicalizer.createRoot();
        _factoryFeatures = DEFAULT_FACTORY_FEATURE_FLAGS;
        _parserFeatures = DEFAULT_PARSER_FEATURE_FLAGS;
        _generatorFeatures = DEFAULT_GENERATOR_FEATURE_FLAGS;
        _rootValueSeparator = DEFAULT_ROOT_VALUE_SEPARATOR;
        _objectCodec = objectcodec;
    }

    protected IOContext _createContext(Object obj, boolean flag)
    {
        return new IOContext(_getBufferRecycler(), obj, flag);
    }

    protected JsonGenerator _createGenerator(Writer writer, IOContext iocontext)
    {
        writer = new WriterBasedJsonGenerator(iocontext, _generatorFeatures, _objectCodec, writer);
        if (_characterEscapes != null)
        {
            writer.setCharacterEscapes(_characterEscapes);
        }
        iocontext = _rootValueSeparator;
        if (iocontext != DEFAULT_ROOT_VALUE_SEPARATOR)
        {
            writer.setRootValueSeparator(iocontext);
        }
        return writer;
    }

    protected JsonParser _createParser(InputStream inputstream, IOContext iocontext)
    {
        return (new ByteSourceJsonBootstrapper(iocontext, inputstream)).constructParser(_parserFeatures, _objectCodec, _byteSymbolCanonicalizer, _rootCharSymbols, _factoryFeatures);
    }

    protected JsonParser _createParser(Reader reader, IOContext iocontext)
    {
        return new ReaderBasedJsonParser(iocontext, _parserFeatures, reader, _objectCodec, _rootCharSymbols.makeChild(_factoryFeatures));
    }

    protected JsonParser _createParser(char ac[], int i, int j, IOContext iocontext, boolean flag)
    {
        return new ReaderBasedJsonParser(iocontext, _parserFeatures, null, _objectCodec, _rootCharSymbols.makeChild(_factoryFeatures), ac, i, i + j, flag);
    }

    protected JsonGenerator _createUTF8Generator(OutputStream outputstream, IOContext iocontext)
    {
        outputstream = new UTF8JsonGenerator(iocontext, _generatorFeatures, _objectCodec, outputstream);
        if (_characterEscapes != null)
        {
            outputstream.setCharacterEscapes(_characterEscapes);
        }
        iocontext = _rootValueSeparator;
        if (iocontext != DEFAULT_ROOT_VALUE_SEPARATOR)
        {
            outputstream.setRootValueSeparator(iocontext);
        }
        return outputstream;
    }

    protected Writer _createWriter(OutputStream outputstream, JsonEncoding jsonencoding, IOContext iocontext)
    {
        if (jsonencoding == JsonEncoding.UTF8)
        {
            return new UTF8Writer(iocontext, outputstream);
        } else
        {
            return new OutputStreamWriter(outputstream, jsonencoding.getJavaName());
        }
    }

    protected final InputStream _decorate(InputStream inputstream, IOContext iocontext)
    {
        Object obj = inputstream;
        if (_inputDecorator != null)
        {
            iocontext = _inputDecorator.decorate(iocontext, inputstream);
            obj = inputstream;
            if (iocontext != null)
            {
                obj = iocontext;
            }
        }
        return ((InputStream) (obj));
    }

    protected final OutputStream _decorate(OutputStream outputstream, IOContext iocontext)
    {
        Object obj = outputstream;
        if (_outputDecorator != null)
        {
            iocontext = _outputDecorator.decorate(iocontext, outputstream);
            obj = outputstream;
            if (iocontext != null)
            {
                obj = iocontext;
            }
        }
        return ((OutputStream) (obj));
    }

    protected final Reader _decorate(Reader reader, IOContext iocontext)
    {
        Object obj = reader;
        if (_inputDecorator != null)
        {
            iocontext = _inputDecorator.decorate(iocontext, reader);
            obj = reader;
            if (iocontext != null)
            {
                obj = iocontext;
            }
        }
        return ((Reader) (obj));
    }

    protected final Writer _decorate(Writer writer, IOContext iocontext)
    {
        Object obj = writer;
        if (_outputDecorator != null)
        {
            iocontext = _outputDecorator.decorate(iocontext, writer);
            obj = writer;
            if (iocontext != null)
            {
                obj = iocontext;
            }
        }
        return ((Writer) (obj));
    }

    public BufferRecycler _getBufferRecycler()
    {
        if (isEnabled(Feature.USE_THREAD_LOCAL_FOR_BUFFER_RECYCLING))
        {
            Object obj = (SoftReference)_recyclerRef.get();
            Object obj1;
            if (obj == null)
            {
                obj = null;
            } else
            {
                obj = (BufferRecycler)((SoftReference) (obj)).get();
            }
            obj1 = obj;
            if (obj == null)
            {
                obj1 = new BufferRecycler();
                _recyclerRef.set(new SoftReference(obj1));
            }
            return ((BufferRecycler) (obj1));
        } else
        {
            return new BufferRecycler();
        }
    }

    public boolean canUseCharArrays()
    {
        return true;
    }

    public JsonGenerator createGenerator(OutputStream outputstream)
    {
        return createGenerator(outputstream, JsonEncoding.UTF8);
    }

    public JsonGenerator createGenerator(OutputStream outputstream, JsonEncoding jsonencoding)
    {
        IOContext iocontext = _createContext(outputstream, false);
        iocontext.setEncoding(jsonencoding);
        if (jsonencoding == JsonEncoding.UTF8)
        {
            return _createUTF8Generator(_decorate(outputstream, iocontext), iocontext);
        } else
        {
            return _createGenerator(_decorate(_createWriter(outputstream, jsonencoding, iocontext), iocontext), iocontext);
        }
    }

    public JsonGenerator createGenerator(Writer writer)
    {
        IOContext iocontext = _createContext(writer, false);
        return _createGenerator(_decorate(writer, iocontext), iocontext);
    }

    public JsonParser createParser(InputStream inputstream)
    {
        IOContext iocontext = _createContext(inputstream, false);
        return _createParser(_decorate(inputstream, iocontext), iocontext);
    }

    public JsonParser createParser(Reader reader)
    {
        IOContext iocontext = _createContext(reader, false);
        return _createParser(_decorate(reader, iocontext), iocontext);
    }

    public JsonParser createParser(String s)
    {
        int i = s.length();
        if (_inputDecorator != null || i > 32768 || !canUseCharArrays())
        {
            return createParser(((Reader) (new StringReader(s))));
        } else
        {
            IOContext iocontext = _createContext(s, true);
            char ac[] = iocontext.allocTokenBuffer(i);
            s.getChars(0, i, ac, 0);
            return _createParser(ac, 0, i, iocontext, true);
        }
    }

    public final boolean isEnabled(Feature feature)
    {
        return (_factoryFeatures & feature.getMask()) != 0;
    }

    static 
    {
        DEFAULT_ROOT_VALUE_SEPARATOR = DefaultPrettyPrinter.DEFAULT_ROOT_VALUE_SEPARATOR;
    }
}
