package com.agencia.autos.repository;

import com.agencia.autos.domain.Auto;
import com.agencia.autos.domain.enumeration.AutoStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutoRepository extends JpaRepository<Auto, Long> {
    Page<Auto> findAllByStatus(AutoStatus status, Pageable pageable);

    List<Auto> findAllByStatusOrderByIdDesc(AutoStatus status);
}
