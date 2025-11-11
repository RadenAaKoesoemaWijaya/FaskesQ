/**
 * @fileOverview Progressive disclosure utility for AI recommendations.
 * Handles partial recommendations and confidence-based filtering.
 */

import { EnhancedExaminationRecommendation } from './enhanced-supporting-examinations-types';

export interface ProgressiveDisclosureConfig {
  minConfidence: number;
  maxRecommendations: number;
  priorityThreshold: 'High' | 'Medium' | 'Low';
  showAlternatives: boolean;
  showContraindications: boolean;
}

export interface ProgressiveRecommendation {
  recommendations: EnhancedExaminationRecommendation[];
  hiddenRecommendations: number;
  confidenceWarning: string | null;
  dataImprovementSuggestions: string[];
  canShowMore: boolean;
}

export class ProgressiveDisclosure {
  private static readonly DEFAULT_CONFIG: ProgressiveDisclosureConfig = {
    minConfidence: 60,
    maxRecommendations: 5,
    priorityThreshold: 'Medium',
    showAlternatives: true,
    showContraindications: true,
  };

  static filterRecommendations(
    recommendations: EnhancedExaminationRecommendation[],
    dataCompleteness: number,
    config: Partial<ProgressiveDisclosureConfig> = {}
  ): ProgressiveRecommendation {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Filter by confidence and priority
    const filteredRecommendations = recommendations.filter(rec => 
      rec.confidence >= fullConfig.minConfidence && 
      this.priorityToNumber(rec.priority) <= this.priorityToNumber(fullConfig.priorityThreshold)
    );

    // Sort by priority and confidence
    const sortedRecommendations = filteredRecommendations.sort((a, b) => {
      const priorityDiff = this.priorityToNumber(a.priority) - this.priorityToNumber(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    // Limit number of recommendations based on data completeness
    const adjustedMaxRecommendations = this.adjustMaxRecommendations(
      fullConfig.maxRecommendations, 
      dataCompleteness
    );

    const visibleRecommendations = sortedRecommendations.slice(0, adjustedMaxRecommendations);
    const hiddenRecommendations = sortedRecommendations.length - visibleRecommendations.length;

    // Generate appropriate warnings and suggestions
    const confidenceWarning = this.generateConfidenceWarning(dataCompleteness, visibleRecommendations.length);
    const dataImprovementSuggestions = this.generateDataImprovementSuggestions(dataCompleteness, recommendations);

    return {
      recommendations: visibleRecommendations,
      hiddenRecommendations,
      confidenceWarning,
      dataImprovementSuggestions,
      canShowMore: hiddenRecommendations > 0 && dataCompleteness >= 70,
    };
  }

  static getProgressiveRecommendations(
    recommendations: EnhancedExaminationRecommendation[],
    currentLevel: number = 1,
    dataCompleteness: number
  ): EnhancedExaminationRecommendation[] {
    const levels = [
      { minConfidence: 80, priorityThreshold: 'High' as const, maxCount: 3 },
      { minConfidence: 70, priorityThreshold: 'High' as const, maxCount: 5 },
      { minConfidence: 60, priorityThreshold: 'Medium' as const, maxCount: 7 },
      { minConfidence: 50, priorityThreshold: 'Medium' as const, maxCount: 10 },
    ];

    const currentConfig = levels[Math.min(currentLevel - 1, levels.length - 1)];
    
    return recommendations
      .filter(rec => 
        rec.confidence >= currentConfig.minConfidence &&
        this.priorityToNumber(rec.priority) <= this.priorityToNumber(currentConfig.priorityThreshold)
      )
      .slice(0, currentConfig.maxCount);
  }

  private static priorityToNumber(priority: string): number {
    switch (priority) {
      case 'High': return 1;
      case 'Medium': return 2;
      case 'Low': return 3;
      default: return 4;
    }
  }

  private static adjustMaxRecommendations(maxRecommendations: number, dataCompleteness: number): number {
    if (dataCompleteness >= 90) return maxRecommendations;
    if (dataCompleteness >= 70) return Math.floor(maxRecommendations * 0.8);
    if (dataCompleteness >= 50) return Math.floor(maxRecommendations * 0.6);
    return Math.floor(maxRecommendations * 0.4);
  }

  private static generateConfidenceWarning(dataCompleteness: number, visibleCount: number): string | null {
    if (dataCompleteness < 50) {
      return 'Data yang tersedia sangat terbatas. Rekomendasi bersifat preliminary dan harus dikonfirmasi dengan evaluasi klinis.';
    }
    if (dataCompleteness < 70) {
      return 'Beberapa data penting masih kurang. Rekomendasi bersifat sementara dan dapat disempurnakan dengan data tambahan.';
    }
    if (visibleCount === 0) {
      return 'Tidak ada rekomendasi yang memenuhi kriteria kepercayaan minimum. Pertimbangkan untuk menurunkan ambang kepercayaan atau menambah data klinis.';
    }
    return null;
  }

  private static generateDataImprovementSuggestions(dataCompleteness: number, recommendations: EnhancedExaminationRecommendation[]): string[] {
    const suggestions: string[] = [];

    if (dataCompleteness < 70) {
      suggestions.push('Lengkapi anamnesis dengan detail gejala, durasi, dan faktor pemicu');
      suggestions.push('Sertakan temuan pemeriksaan fisik yang lebih lengkap');
    }

    if (dataCompleteness < 50) {
      suggestions.push('Pertimbangkan untuk menambahkan diagnosis banding untuk diferensiasi yang lebih baik');
    }

    const lowConfidenceRecommendations = recommendations.filter(rec => rec.confidence < 70);
    if (lowConfidenceRecommendations.length > 0) {
      suggestions.push(`Beberapa rekomendasi memiliki kepercayaan rendah (${lowConfidenceRecommendations.length} rekomendasi). Pertimbangkan untuk menambahkan data klinis yang lebih spesifik.`);
    }

    return suggestions;
  }

  static formatConfidenceScore(score: number): string {
    if (score >= 90) return 'Sangat Tinggi';
    if (score >= 80) return 'Tinggi';
    if (score >= 70) return 'Menengah';
    if (score >= 60) return 'Cukup';
    return 'Rendah';
  }

  static getConfidenceColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
}