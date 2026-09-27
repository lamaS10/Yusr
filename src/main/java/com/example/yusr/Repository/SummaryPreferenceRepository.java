package com.example.yusr.Repository;

import com.example.yusr.Model.SummaryPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SummaryPreferenceRepository extends JpaRepository<SummaryPreference, Integer> {

    SummaryPreference findSummaryPreferenceById(Integer id);

    SummaryPreference findSummaryPreferenceByCaregiverId(Integer caregiverId);
    List<SummaryPreference> findSummaryPreferencesByAutoGenerateTrueAndNextGenerationAtLessThanEqual(LocalDateTime now);
}