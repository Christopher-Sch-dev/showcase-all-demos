/**
 * Utilidades Matemáticas para Preloader Generativo
 * Funciones puras para cálculos de geometría, SDF y coordenadas polares
 * 
 * Razón: Separación de responsabilidades - lógica matemática aislada del renderizado
 */

/**
 * Convierte coordenadas cartesianas a polares
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {{r: number, theta: number}} Radio y ángulo en radianes
 */
export function cartToPolar(x, y) {
  return {
    r: Math.sqrt(x * x + y * y),
    theta: Math.atan2(y, x)
  };
}

/**
 * Convierte coordenadas polares a cartesianas
 * @param {number} r - Radio
 * @param {number} theta - Ángulo en radianes
 * @returns {{x: number, y: number}} Coordenadas cartesianas
 */
export function polarToCart(r, theta) {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta)
  };
}

/**
 * Genera un punto en una curva rosa (rose curve)
 * Fórmula: r = amplitude * cos(k * theta)
 * k determina el número de pétalos
 * 
 * @param {number} theta - Ángulo en radianes
 * @param {number} k - Factor de pétalos (entero = k pétalos si impar, 2k si par)
 * @param {number} amplitude - Radio máximo
 * @returns {{x: number, y: number}} Punto en la curva
 */
export function rosePoint(theta, k, amplitude) {
  const r = amplitude * Math.cos(k * theta);
  return polarToCart(r, theta);
}

/**
 * Signed Distance Function para círculo
 * Retorna distancia negativa si está dentro, positiva si está fuera
 * 
 * @param {number} x - Coordenada X relativa al centro
 * @param {number} y - Coordenada Y relativa al centro
 * @param {number} radius - Radio del círculo
 * @returns {number} Distancia signada
 */
export function sdfCircle(x, y, radius) {
  return Math.sqrt(x * x + y * y) - radius;
}

/**
 * SDF para polígono regular
 * 
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} radius - Radio circunscrito
 * @param {number} sides - Número de lados (3=triángulo, 6=hexágono, etc.)
 * @returns {number} Distancia signada
 */
export function sdfPolygon(x, y, radius, sides) {
  const angle = Math.atan2(y, x);
  const segAngle = (Math.PI * 2) / sides;
  const theta = Math.abs((angle % segAngle) - segAngle / 2);
  const dist = Math.sqrt(x * x + y * y);
  return dist * Math.cos(theta) / Math.cos(segAngle / 2) - radius;
}

/**
 * SDF para estrella
 * 
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} outerRadius - Radio exterior (puntas)
 * @param {number} innerRadius - Radio interior (valles)
 * @param {number} points - Número de puntas
 * @returns {number} Distancia signada aproximada
 */
export function sdfStar(x, y, outerRadius, innerRadius, points) {
  const angle = Math.atan2(y, x);
  const segAngle = Math.PI / points;
  const dist = Math.sqrt(x * x + y * y);
  
  const normalizedAngle = ((angle % (2 * segAngle)) + 2 * segAngle) % (2 * segAngle);
  const isOuter = normalizedAngle < segAngle;
  const targetRadius = isOuter ? outerRadius : innerRadius;
  
  return dist - targetRadius;
}

/**
 * Función de ruido simple basada en seno
 * Útil para variaciones orgánicas sin librerías externas
 * 
 * @param {number} x - Entrada X
 * @param {number} y - Entrada Y (opcional)
 * @param {number} seed - Semilla para variación
 * @returns {number} Valor entre -1 y 1
 */
export function simpleNoise(x, y = 0, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Interpola linealmente entre dos valores
 * 
 * @param {number} a - Valor inicial
 * @param {number} b - Valor final
 * @param {number} t - Factor de interpolación (0-1)
 * @returns {number} Valor interpolado
 */
export function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Mapea un valor de un rango a otro
 * 
 * @param {number} value - Valor a mapear
 * @param {number} inMin - Mínimo del rango de entrada
 * @param {number} inMax - Máximo del rango de entrada
 * @param {number} outMin - Mínimo del rango de salida
 * @param {number} outMax - Máximo del rango de salida
 * @returns {number} Valor mapeado
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Función de easing suave (ease-in-out cubic)
 * 
 * @param {number} t - Valor entre 0 y 1
 * @returns {number} Valor suavizado entre 0 y 1
 */
export function easeInOutCubic(t) {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Genera puntos para un anillo de partículas simétricas
 * 
 * @param {number} count - Número de partículas
 * @param {number} radius - Radio del anillo
 * @param {number} symmetry - Ejes de simetría
 * @returns {Array<{x: number, y: number, angle: number}>} Array de puntos
 */
export function generateSymmetricRing(count, radius, symmetry) {
  const points = [];
  const particlesPerSegment = Math.floor(count / symmetry);
  const segmentAngle = (Math.PI * 2) / symmetry;
  
  for (let seg = 0; seg < symmetry; seg++) {
    for (let i = 0; i < particlesPerSegment; i++) {
      const baseAngle = segmentAngle * seg + (segmentAngle / particlesPerSegment) * i;
      const { x, y } = polarToCart(radius, baseAngle);
      points.push({ x, y, angle: baseAngle });
    }
  }
  
  return points;
}
