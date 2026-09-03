package com.dsp.service;

import java.util.*;

/**
 * ============================================================================
 * MODULE: PassportSearchEngine & Skill Radar Matrix
 * DATA STRUCTURES: HashMap, HashSet, and Multi-Axis Radial Graph
 * ============================================================================
 */
public class PassportSearchEngine {

    // Multi-Axis Skill Radar Node
    public static class SkillNode {
        public String skillName;
        public int proficiency; // 0 to 100

        public SkillNode(String skillName, int proficiency) {
            this.skillName = skillName;
            this.proficiency = proficiency;
        }
    }

    // Inverted Index Search Engine using HashMap
    private Map<String, Set<String>> skillToPassportIdMap = new HashMap<>();

    public void indexSkill(String passportId, String skill) {
        String key = skill.toLowerCase().trim();
        skillToPassportIdMap.computeIfAbsent(key, k -> new HashSet<>()).add(passportId);
    }

    public Set<String> searchBySkill(String skill) {
        return skillToPassportIdMap.getOrDefault(skill.toLowerCase().trim(), Collections.emptySet());
    }

    public static void main(String[] args) {
        PassportSearchEngine engine = new PassportSearchEngine();
        engine.indexSkill("KASHVI-8A2F91", "Java");
        engine.indexSkill("KASHVI-8A2F91", "React");
        engine.indexSkill("CHANDA-69AD7A", "Java");

        System.out.println("Passports with skill 'Java': " + engine.searchBySkill("Java"));
        System.out.println("Passports with skill 'React': " + engine.searchBySkill("React"));
    }
}
