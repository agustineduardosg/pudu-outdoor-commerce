# Guía Google Flow — Influencers PUDU

Objetivo: conservar identidad, prenda y dirección de arte entre imágenes y clips para el catálogo PUDU.

## Preparación de ingredientes

Crear un proyecto llamado `PUDU Mujer — Cápsula 01` y cargar como activos separados:

1. **Personaje:** una lámina limpia del influencer con rostro frontal, tres cuartos y cuerpo completo, ropa base neutra y luz uniforme.
2. **Prenda:** el packshot frontal de Polar Lenga o Softshell Austral sobre fondo limpio.
3. **Escena:** una referencia de territorio chileno sin personas ni marcas.

Google recomienda ingredientes limpios, sin sujetos extra y con una apariencia consistente. Flow permite guardar un personaje reutilizable con referencias visuales y voz; Ingredients/References to Video usa las mismas imágenes entre clips para mejorar continuidad. La disponibilidad exacta depende del modelo y del plan activo.

Fuentes oficiales:

- [Crear videos y usar ingredientes en Google Flow](https://support.google.com/flow/answer/16353334?hl=en)
- [Administrar personajes y activos](https://support.google.com/labs/answer/16935308?hl=en)
- [Modelos y funciones compatibles](https://support.google.com/flow/answer/16352836?hl=en)
- [Actualización Veo 3.1 Ingredients to Video](https://blog.google/innovation-and-ai/technology/ai/veo-3-1-ingredients-to-video/)

## Regla de consistencia

Usar un personaje, una prenda y una escena por generación. No pedir cambios simultáneos de rostro, vestuario, locación y cámara. Aprobar primero una imagen maestra estática y usarla como punto de partida de los clips.

## Prompt maestro — Imagen de campaña

```text
Usa @INFLUENCER como referencia estricta de identidad y proporciones. Usa @PRENDA_PUDU como referencia estricta de diseño, color, materiales, costuras, cierres y aplicación del logo. Viste al personaje con esa prenda sin cambiar ningún detalle del producto.

Retrato editorial outdoor chileno premium. La mujer camina de forma natural por @ESCENA_CHILE durante una mañana fría y nublada. Plano de cuerpo completo a tres cuartos, cámara a la altura del pecho, luz natural suave, textura real de piel y tejido, color sobrio, actitud segura y serena.

Mantener exactamente el rostro, cabello y cuerpo del personaje. Mantener exactamente la prenda PUDU, su calce, color, cierres, bolsillos y logo pequeño del pecho. No agregar marcas, texto, equipo técnico, joyas llamativas ni elementos de moda ajenos. No exagerar clima ni prestaciones.
```

## Prompt — Video vertical de producto

```text
Usa @INFLUENCER, @PRENDA_PUDU y @ESCENA_CHILE como ingredientes estrictos. Video editorial vertical 9:16, movimiento realista y contenido. La influencer avanza tres pasos por el sendero, se detiene y ajusta una sola vez el cierre de la chaqueta. Viento leve mueve apenas el cabello y la vegetación. La cámara realiza un acercamiento lento desde plano medio hasta detalle del pecho.

La identidad del personaje y el diseño de la prenda deben permanecer estables en cada cuadro. El logo PUDU no cambia de forma, tamaño ni posición. Sin diálogo, sin texto en pantalla, sin música generada, sin otras personas, sin cambios de ropa, sin deformación de manos o cierres. Luz natural nublada, movimiento de cámara suave, campaña outdoor chilena premium.
```

## Prompt — Detalle de material

```text
Usa @PRENDA_PUDU como referencia exacta. Macro cinematográfico de 8 segundos de la mano de @INFLUENCER tocando suavemente la textura de la manga y luego el tirador del cierre. Mantener construcción, color, logo y material sin alteraciones. Fondo @ESCENA_CHILE muy desenfocado, luz fría suave, profundidad de campo corta, movimiento lento. Sin texto, sin marcas adicionales, sin inventar gotas de agua ni demostraciones técnicas.
```

## Secuencia inicial de campaña

1. `Presentación`: 6–8 s, cuerpo completo, caminar breve.
2. `Función`: 6–8 s, ajuste de cierre o capucha.
3. `Material`: 6–8 s, macro de tejido y terminaciones.
4. `Territorio`: 6–8 s, plano amplio sin afirmaciones de rendimiento.
5. `Cierre`: 4–6 s, influencer quieta y logo visible; el texto se agrega después en edición, no dentro de la generación.

## Control de calidad antes de publicar

- comparar rostro contra la lámina maestra;
- comparar bolsillos, costuras, cierre y capucha contra el packshot;
- revisar el logo cuadro por cuadro;
- descartar manos deformes, cierres que cambian o prendas que mutan;
- no publicar materiales o prestaciones que aún no estén confirmados por fábrica;
- identificar el contenido generado por IA según las reglas aplicables y conservar SynthID.
