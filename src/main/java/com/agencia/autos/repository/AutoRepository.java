package com.agencia.autos.repository;

import com.agencia.autos.domain.Auto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutoRepository extends JpaRepository<Auto, Long> {}
