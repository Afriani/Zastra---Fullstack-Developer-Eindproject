package com.zastra.zastra.media.repo;

import com.zastra.zastra.media.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByOwnerUserId(Long ownerUserId);

}


