import { describe, it, expect } from 'vitest';
import { nutrientBrands, nutrientTargets, getNutrientTarget } from '@/data/nutrient-brands';

describe('Nutrient Calculator', () => {
  it('should have multiple brands', () => {
    expect(nutrientBrands.length).toBeGreaterThanOrEqual(3);
  });

  it('should have Thai-available brands', () => {
    const thaiAvailable = nutrientBrands.filter((b) => b.availableInThailand);
    expect(thaiAvailable.length).toBeGreaterThanOrEqual(2);
  });

  it('should have targets for common plants', () => {
    expect(getNutrientTarget('Lettuce', 'vegetative')).toBeDefined();
    expect(getNutrientTarget('Tomato', 'vegetative')).toBeDefined();
    expect(getNutrientTarget('Tomato', 'fruiting')).toBeDefined();
    expect(getNutrientTarget('Basil', 'vegetative')).toBeDefined();
  });

  it('should return correct EC range for lettuce', () => {
    const target = getNutrientTarget('Lettuce', 'vegetative')!;
    expect(target.ec.min).toBeLessThan(target.ec.max);
    expect(target.ec.min).toBeGreaterThan(0);
    expect(target.ec.max).toBeLessThan(5);
  });

  it('should return correct pH range', () => {
    const target = getNutrientTarget('Tomato', 'vegetative')!;
    expect(target.ph.min).toBeGreaterThanOrEqual(5.0);
    expect(target.ph.max).toBeLessThanOrEqual(7.0);
  });

  it('should include micronutrients', () => {
    const target = getNutrientTarget('Tomato', 'vegetative')!;
    expect(target.micronutrients.ca).toBeGreaterThan(0);
    expect(target.micronutrients.mg).toBeGreaterThan(0);
    expect(target.micronutrients.fe).toBeGreaterThan(0);
  });

  it('should have mixing ratios for each brand product', () => {
    nutrientBrands.forEach((brand) => {
      brand.products.forEach((product) => {
        expect(product.mixingRatio.ml).toBeGreaterThan(0);
        expect(product.mixingRatio.perLiters).toBeGreaterThan(0);
        expect(product.targetPH.min).toBeLessThan(product.targetPH.max);
      });
    });
  });
});
