// src/components/ActionButton/ActionButton.jsx
import { useMemo } from "react";
import "./AxtionButton.css";

/**
 * Botón con skin SVG (estilos en ActionButton.css).
 *
 * Props:
 *  - children: texto del botón
 *  - onClick, disabled, title ... (como <button>)
 *  - bg, bgHover, bgActive: rutas SVG (opcionales; por defecto /assets/UI/...)
 *  - width, height: tamaños CSS opcionales
 *  - className, style, labelStyle: overrides
 */
export default function ActionButton({
  children,
  onClick,
  disabled = false,
  title,
  bg,
  bgHover,
  bgActive,
  width,
  height,
  className = "",
  style = {},
  labelStyle = {},
  ...rest
}) {
  // Pasamos overrides como CSS variables (si no las pasas, se usan las del .css)
  const styleVars = useMemo(() => {
    const vars = {};
    if (width) vars["--btn-w"] = width;
    if (height) vars["--btn-h"] = height;
    if (bg) vars["--btn-bg"] = `url(${bg})`;
    if (bgHover) vars["--btn-bg-hover"] = `url(${bgHover})`;
    if (bgActive) vars["--btn-bg-active"] = `url(${bgActive})`;
    return vars;
  }, [width, height, bg, bgHover, bgActive]);

  return (
    <button
      type="button"
      className={`action-btn ${className}`}
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...styleVars, ...style }}
      {...rest}
    >
      <span className="action-btn__label" style={labelStyle}>
        {children}
      </span>
    </button>
  );
}
