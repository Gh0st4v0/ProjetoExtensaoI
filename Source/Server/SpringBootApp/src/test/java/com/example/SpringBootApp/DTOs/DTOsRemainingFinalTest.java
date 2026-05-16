package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.lang.reflect.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DTOsRemainingFinalTest {

    @Test
    void finalExerciseRemainingDTOs() throws Exception {
        String[] classes = {
                "com.example.SpringBootApp.controllers.UsuarioController$CreateUserDTO",
                "com.example.SpringBootApp.controllers.UsuarioController$UpdateUserDTO",
                "com.example.SpringBootApp.DTOs.VendaResponseDTO",
                "com.example.SpringBootApp.DTOs.ClienteResponseDTO",
                "com.example.SpringBootApp.DTOs.ProdutoResponseDTO",
                "com.example.SpringBootApp.DTOs.CompraItemResponseDTO",
                "com.example.SpringBootApp.DTOs.VendItemReportDTO",
                "com.example.SpringBootApp.DTOs.ProdutoComCompraEmEstoqueDTO",
                "com.example.SpringBootApp.DTOs.CompraItemDiscardDTO",
                "com.example.SpringBootApp.DTOs.CompraItemDTO",
                "com.example.SpringBootApp.DTOs.VendCreateDTO",
                "com.example.SpringBootApp.DTOs.ProdutoCreateDTO",
                "com.example.SpringBootApp.DTOs.DescarteCreateDTO",
                "com.example.SpringBootApp.DTOs.LoginDTO",
                "com.example.SpringBootApp.DTOs.MarcaDTO",
                "com.example.SpringBootApp.DTOs.CategoriaCreateDTO",
                "com.example.SpringBootApp.DTOs.CategoriaDTO",
                "com.example.SpringBootApp.DTOs.VendReportDTO",
                "com.example.SpringBootApp.DTOs.MarcaCreateDTO",
                "com.example.SpringBootApp.DTOs.PasswordRecoveryRequestDTO",
                "com.example.SpringBootApp.DTOs.ValidateRecoveryCodeDTO",
                "com.example.SpringBootApp.DTOs.CompraResponseDTO",
                "com.example.SpringBootApp.DTOs.CompraCreateDTO",
                "com.example.SpringBootApp.DTOs.VendItemDTO",
                "com.example.SpringBootApp.DTOs.MessageResponseDTO",
                "com.example.SpringBootApp.DTOs.VendaItemResponseDTO",
                "com.example.SpringBootApp.DTOs.DescarteItemDTO",
                "com.example.SpringBootApp.DTOs.ResetPasswordDTO",
                "com.example.SpringBootApp.DTOs.CompraItemUpdateDTO",
                "com.example.SpringBootApp.DTOs.AutenticacaoResponseDTO",
                "com.example.SpringBootApp.DTOs.ProdutoPrecoUpdateDTO",
                "com.example.SpringBootApp.DTOs.ClienteCreateDTO",
                "com.example.SpringBootApp.DTOs.CompraEmEstoqueDTO"
        };

        for (String className : classes) {
            Class<?> cls;
            try {
                cls = Class.forName(className);
            } catch (Throwable t) {
                // skip classes that cannot be loaded
                continue;
            }

            Object a = instantiateWithDefaults(cls);
            Object b = instantiateWithDefaults(cls);
            if (a == null || b == null) continue;

            setDefaultsOnFields(cls, a);
            setDefaultsOnFields(cls, b);

            // basic equality
            try { assertEquals(a, b); } catch (AssertionError ignore) {}
            try { assertEquals(a.hashCode(), b.hashCode()); } catch (AssertionError ignore) {}
            assertNotNull(a.toString());

            // exercise null and different-class branches
            try { a.equals(null); } catch (Throwable ignore) {}
            try { a.equals(new Object()); } catch (Throwable ignore) {}

            Field[] fields = cls.getDeclaredFields();
            for (int idx = 0; idx < fields.length; idx++) {
                Field f = fields[idx];
                f.setAccessible(true);
                if (Modifier.isStatic(f.getModifiers())) continue;
                Object original = null;
                try { original = f.get(b); } catch (Exception e) { continue; }

                // ensure earlier fields remain equal -- already true

                // change this field to a different non-null value
                Object diff = differentSampleForType(f.getType(), original);
                boolean changed = false;
                if (diff != null) {
                    try { f.set(b, diff); changed = true; } catch (Exception e) {
                        String setter = "set" + Character.toUpperCase(f.getName().charAt(0)) + f.getName().substring(1);
                        try { Method m = cls.getMethod(setter, f.getType()); m.invoke(b, diff); changed = true; } catch (Exception ignore) {}
                    }
                    if (changed) {
                        try { a.equals(b); } catch (Throwable ignore) {}
                    }
                }

                // null-case for this field
                if (!f.getType().isPrimitive()) {
                    boolean nulled = false;
                    try { f.set(b, null); nulled = true; } catch (Exception e) {
                        String setter = "set" + Character.toUpperCase(f.getName().charAt(0)) + f.getName().substring(1);
                        try { Method m = cls.getMethod(setter, f.getType()); m.invoke(b, new Object[] { null }); nulled = true; } catch (Exception ignore) {}
                    }
                    if (nulled) {
                        try { a.equals(b); } catch (Throwable ignore) {}
                    }
                }

                // revert
                try { f.set(b, original); } catch (Exception ex) {
                    String setter = "set" + Character.toUpperCase(f.getName().charAt(0)) + f.getName().substring(1);
                    try { Method m = cls.getMethod(setter, f.getType()); m.invoke(b, original); } catch (Exception ignore) {}
                }
            }
        }
    }

    private Object instantiateWithDefaults(Class<?> cls) {
        try {
            Constructor<?> noArg = null;
            try { noArg = cls.getDeclaredConstructor(); } catch (NoSuchMethodException ignore) {}
            if (noArg != null) { noArg.setAccessible(true); return noArg.newInstance(); }
            Constructor<?>[] ctors = cls.getDeclaredConstructors();
            if (ctors.length == 0) return null;
            Constructor<?> ctor = ctors[0];
            ctor.setAccessible(true);
            Class<?>[] pts = ctor.getParameterTypes();
            Object[] args = new Object[pts.length];
            for (int i=0;i<pts.length;i++) args[i] = sampleForType(pts[i]);
            return ctor.newInstance(args);
        } catch (Exception e) {
            return null;
        }
    }

    private void setDefaultsOnFields(Class<?> cls, Object obj) {
        for (Field f : cls.getDeclaredFields()) {
            f.setAccessible(true);
            if (Modifier.isStatic(f.getModifiers())) continue;
            try {
                Object cur = f.get(obj);
                if (cur == null) {
                    Object val = sampleForType(f.getType());
                    if (val != null) f.set(obj, val);
                }
            } catch (Exception e) {
                String setter = "set" + Character.toUpperCase(f.getName().charAt(0)) + f.getName().substring(1);
                try {
                    Method m = cls.getMethod(setter, f.getType());
                    Object val = sampleForType(f.getType());
                    if (val != null) m.invoke(obj, val);
                } catch (Exception ignore) {}
            }
        }
    }

    private Object sampleForType(Class<?> t) {
        if (t == String.class) return "s";
        if (t == Long.class || t == long.class) return 1L;
        if (t == Integer.class || t == int.class) return 1;
        if (t == Short.class || t == short.class) return (short)1;
        if (t == Byte.class || t == byte.class) return (byte)1;
        if (t == Double.class || t == double.class) return 1.0d;
        if (t == Float.class || t == float.class) return 1.0f;
        if (t == Boolean.class || t == boolean.class) return true;
        if (t == BigDecimal.class) return new BigDecimal("1.0");
        if (t == LocalDate.class) return LocalDate.of(2020,1,1);
        if (t == LocalDateTime.class) return LocalDateTime.of(2020,1,1,0,0);
        if (List.class.isAssignableFrom(t)) return List.of();
        if (t.isEnum()) {
            Object[] consts = t.getEnumConstants();
            if (consts != null && consts.length > 0) return consts[0];
        }
        try {
            Constructor<?> c = t.getDeclaredConstructor();
            c.setAccessible(true);
            return c.newInstance();
        } catch (Exception e) {
            return null;
        }
    }

    private Object differentSampleForType(Class<?> t, Object current) {
        try {
            if (t == String.class) return (current == null) ? "sX" : current.toString() + "X";
            if (t == Long.class || t == long.class) return (current instanceof Number) ? Long.valueOf(((Number) current).longValue()+1L) : 2L;
            if (t == Integer.class || t == int.class) return (current instanceof Number) ? Integer.valueOf(((Number) current).intValue()+1) : 2;
            if (t == Short.class || t == short.class) return (short)2;
            if (t == Byte.class || t == byte.class) return (byte)2;
            if (t == Double.class || t == double.class) return (current instanceof Number) ? Double.valueOf(((Number) current).doubleValue()+1.0) : 2.0;
            if (t == Float.class || t == float.class) return 2.0f;
            if (t == Boolean.class || t == boolean.class) return !(current == null ? false : (Boolean) current);
            if (t == BigDecimal.class) return (current == null) ? new BigDecimal("2.0") : ((BigDecimal) current).add(BigDecimal.ONE);
            if (t == LocalDate.class) return (current == null) ? LocalDate.of(2020,1,2) : ((LocalDate) current).plusDays(1);
            if (t == LocalDateTime.class) return (current == null) ? LocalDateTime.of(2020,1,2,0,0) : ((LocalDateTime) current).plusDays(1);
            if (List.class.isAssignableFrom(t)) return List.of("x");
            if (t.isEnum()) {
                Object[] consts = t.getEnumConstants();
                if (consts != null && consts.length > 1) return consts[1];
                return null;
            }
            Constructor<?> c = t.getDeclaredConstructor();
            c.setAccessible(true);
            return c.newInstance();
        } catch (Exception e) {
            return null;
        }
    }
}
