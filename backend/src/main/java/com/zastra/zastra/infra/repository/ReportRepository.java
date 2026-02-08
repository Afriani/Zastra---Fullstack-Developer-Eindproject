package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.ReportCategory;
import com.zastra.zastra.infra.enums.ReportStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // ✅ Fetch user's reports WITH status history (images loaded via @Fetch(SUBSELECT))
    @Query("SELECT DISTINCT r FROM Report r " +
            "LEFT JOIN FETCH r.statusHistory " +
            "WHERE r.user.id = :userId " +
            "ORDER BY r.createdAt DESC")
    List<Report> findByUserIdWithHistory(@Param("userId") Long userId);

    // ✅ Fetch single report WITH status history (images loaded via @Fetch(SUBSELECT))
    @Query("SELECT DISTINCT r FROM Report r " +
            "LEFT JOIN FETCH r.statusHistory " +
            "WHERE r.id = :reportId")
    Optional<Report> findByIdWithHistory(@Param("reportId") Long reportId);

    // ✅ Fetch officer's reports by ID WITH status history (images loaded via @Fetch(SUBSELECT))
    @Query("SELECT DISTINCT r FROM Report r " +
            "LEFT JOIN FETCH r.statusHistory " +
            "WHERE r.officer.id = :officerId " +
            "ORDER BY r.createdAt DESC")
    List<Report> findByOfficerIdWithHistory(@Param("officerId") Long officerId);

    // ✅ Fetch officer's reports by email WITH status history (images loaded via @Fetch(SUBSELECT))
    @Query("SELECT DISTINCT r FROM Report r " +
            "LEFT JOIN FETCH r.statusHistory " +
            "WHERE r.officer.email = :officerEmail " +
            "ORDER BY r.createdAt DESC")
    List<Report> findByOfficerEmailWithHistory(@Param("officerEmail") String officerEmail);

    @Query(value = """
    SELECT AVG(EXTRACT(EPOCH FROM (r.resolved_at - r.created_at)))/86400.0
    FROM reports r
    WHERE r.status = 'RESOLVED'
      AND r.resolved_at >= :fromTs
      AND (:officerId IS NULL OR r.officer_id = :officerId)
""", nativeQuery = true)
    Double avgResolutionDaysSince(@Param("fromTs") java.sql.Timestamp fromTs,
                                  @Param("officerId") Long officerId);

    @Query(value = """
    SELECT COUNT(*)
    FROM reports r
    WHERE r.created_at >= :fromTs
      AND (:officerId IS NULL OR r.officer_id = :officerId)
""", nativeQuery = true)
    long countCreatedSince(@Param("fromTs") java.sql.Timestamp fromTs,
                           @Param("officerId") Long officerId);

    @Query(value = """
    SELECT COUNT(*)
    FROM reports r
    WHERE r.created_at >= :fromTs
      AND r.status = 'RESOLVED'
      AND (:officerId IS NULL OR r.officer_id = :officerId)
""", nativeQuery = true)
    long countResolvedCreatedSince(@Param("fromTs") java.sql.Timestamp fromTs,
                                   @Param("officerId") Long officerId);

    @Query(value = """
    SELECT COUNT(*)
    FROM reports r
    WHERE r.status = 'RESOLVED'
      AND r.resolved_at >= :fromTs
      AND (EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))/86400.0) <= :slaDays
      AND (:officerId IS NULL OR r.officer_id = :officerId)
""", nativeQuery = true)
    long countResolvedWithinSlaSince(@Param("fromTs") java.sql.Timestamp fromTs,
                                     @Param("slaDays") double slaDays,
                                     @Param("officerId") Long officerId);

    @Query(value = """
    SELECT COUNT(*)
    FROM reports r
    WHERE r.status = 'RESOLVED'
      AND r.resolved_at >= :fromTs
      AND (:officerId IS NULL OR r.officer_id = :officerId)
""", nativeQuery = true)
    long countResolvedByResolvedAtSince(@Param("fromTs") java.sql.Timestamp fromTs,
                                        @Param("officerId") Long officerId);

    @Query(value = """
    SELECT CAST(r.resolved_at AS DATE) AS day,
           AVG(EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))/86400.0) AS avg_days
    FROM reports r
    WHERE r.status = 'RESOLVED'
      AND r.resolved_at >= :fromTs
      AND (:officerId IS NULL OR r.officer_id = :officerId)
    GROUP BY day
    ORDER BY day
""", nativeQuery = true)
    List<Object[]> dailyAvgResolutionSince(@Param("fromTs") java.sql.Timestamp fromTs,
                                           @Param("officerId") Long officerId);

    // Get all submitted reports (regardless of assignment)
    List<Report> findAllByOrderByCreatedAtDesc();

    // Get all reports by status
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    List<Report> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Report> findByOfficerId(Long officerId);

    List<Report> findByOfficer_EmailAndStatus(String officerEmail, ReportStatus status);

    List<Report> findByUser_Email(String email);

    // Find reports by user and status, ordered by creation date (newest first)
    List<Report> findByUserAndStatusOrderByCreatedAtDesc(User user, ReportStatus status);

    // Add derived query methods to count reports by user email and status.
    long countByUser_Email(String email);

    long countByUser_EmailAndStatus(String email, ReportStatus status);

    Page<Report> findByOfficer_Email(String email, Pageable pageable);

    Page<Report> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Report> findByUser_Email(String email, Pageable pageable);

    Page<Report> findByStatusAndCategory(ReportStatus status, ReportCategory category, Pageable pageable);

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByCategory(ReportCategory category, Pageable pageable);

    long countByOfficer_IdAndStatusIn(Long officerId, List<ReportStatus> statuses);

    long countByOfficer_Email(String officerEmail);

    long countByOfficer_EmailAndStatus(String officerEmail, ReportStatus status);

    List<Report> findByOfficer_Email(String officerEmail);

    @Query("SELECT r FROM Report r WHERE r.latitude BETWEEN :minLat AND :maxLat " +
            "AND r.longitude BETWEEN :minLng AND :maxLng")
    List<Report> findReportsInArea(@Param("minLat") Double minLat,
                                   @Param("maxLat") Double maxLat,
                                   @Param("minLng") Double minLng,
                                   @Param("maxLng") Double maxLng);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.user.id = :userId AND r.status IN :statuses")
    long countByUserIdAndStatusIn(@Param("userId") Long userId, @Param("statuses") List<ReportStatus> statuses);

    long countByStatus(ReportStatus reportStatus);

    @Query("SELECT r.status, COUNT(r) FROM Report r GROUP BY r.status")
    List<Object[]> countByStatusGrouped();

    // Get all reports with search functionality (title or description contains search term)
    @Query("SELECT r FROM Report r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))" +
            "ORDER BY r.createdAt DESC")
    List<Report> findAllReportsWithFilters(@Param("status") ReportStatus status,
                                           @Param("search") String search);

    // Resolved in last 30 days (resolvedAt not null, >= threshold)
    @Query("select count(r) from Report r where r.status = com.zastra.zastra.infra.enums.ReportStatus.RESOLVED and r.resolvedAt >= :fromInclusive")
    long countResolvedSince(LocalDateTime fromInclusive);

    // Avg resolution time in days for reports resolved since threshold
//    @Query(value = """
//                select avg(EXTRACT(EPOCH from (r.resolved_at - r.created_at)))/86400.0
//                from reports r
//                where r.status = 'RESOLVED'
//                  and r.resolved_at >= :fromInclusive
//            """, nativeQuery = true)
//    Double avgResolutionDaysSince(LocalDateTime fromInclusive);

    // Category aggregation (string category)
    @Query("select r.category as category, count(r) as cnt from Report r group by r.category")
    List<Object[]> countByCategory();

    // Recent reports
    @Query("select r from Report r order by r.createdAt desc")
    List<Report> findRecent(Pageable pageable);

    // Open assigned count by officer
    @Query("""
                select r.officer.id as officerId,
                       CONCAT(r.officer.firstName, ' ', r.officer.lastName) as officerName,
                       count(r) as cnt
                from Report r
                where r.status in (com.zastra.zastra.infra.enums.ReportStatus.SUBMITTED, com.zastra.zastra.infra.enums.ReportStatus.IN_PROGRESS)
                  and r.officer is not null
                group by r.officer.id, r.officer.firstName, r.officer.lastName
                order by cnt desc
            """)
    List<Object[]> openAssignedCountByOfficer();

    // ✅ Admin filtered reports with boolean flags
    @Query("""
  select r from Report r
  where (:hasStatus = false or r.status = :status)
    and (:hasCategory = false or r.category = :category)
    and (:hasOfficer = false or (r.officer is not null and r.officer.id = :officerId))
    and (:hasFrom = false or r.createdAt >= :from)
    and (:hasTo = false or r.createdAt <= :to)
    and ( :searchEmpty = true
          or lower(r.title) like lower(:searchLike)
          or lower(r.description) like lower(:searchLike)
        )
""")
    Page<Report> findAdminFiltered(
            Pageable pageable,
            @Param("hasStatus") boolean hasStatus,
            @Param("status") ReportStatus status,
            @Param("hasCategory") boolean hasCategory,
            @Param("category") ReportCategory category,
            @Param("hasOfficer") boolean hasOfficer,
            @Param("officerId") Long officerId,
            @Param("hasFrom") boolean hasFrom,
            @Param("from") LocalDateTime from,
            @Param("hasTo") boolean hasTo,
            @Param("to") LocalDateTime to,
            @Param("searchEmpty") boolean searchEmpty,
            @Param("searchLike") String searchLike
    );

    // ✅ Admin count by status with boolean flags
    @Query("""
  select r.status, count(r)
  from Report r
  where (:hasFrom = false or r.createdAt >= :from)
    and (:hasTo = false or r.createdAt <= :to)
    and (:hasCategory = false or r.category = :category)
    and (:hasOfficer = false or (r.officer is not null and r.officer.id = :officerId))
  group by r.status
  order by r.status
""")
    List<Object[]> adminCountByStatusJpql(
            @Param("hasFrom") boolean hasFrom, @Param("from") LocalDateTime from,
            @Param("hasTo") boolean hasTo, @Param("to") LocalDateTime to,
            @Param("hasCategory") boolean hasCategory, @Param("category") ReportCategory category,
            @Param("hasOfficer") boolean hasOfficer, @Param("officerId") Long officerId
    );

    // ✅ Admin count by category with boolean flags
    @Query("""
  select r.category, count(r)
  from Report r
  where (:hasFrom = false or r.createdAt >= :from)
    and (:hasTo = false or r.createdAt <= :to)
    and (:hasStatus = false or r.status = :status)
    and (:hasOfficer = false or (r.officer is not null and r.officer.id = :officerId))
  group by r.category
  order by count(r) desc
""")
    List<Object[]> adminCountByCategoryJpql(
            @Param("hasFrom") boolean hasFrom, @Param("from") LocalDateTime from,
            @Param("hasTo") boolean hasTo, @Param("to") LocalDateTime to,
            @Param("hasStatus") boolean hasStatus, @Param("status") ReportStatus status,
            @Param("hasOfficer") boolean hasOfficer, @Param("officerId") Long officerId
    );

    // ✅ Admin average resolution days with boolean flags (native query)
    @Query(value = """
              select avg(extract(epoch from (r.resolved_at - r.created_at)))/86400.0
              from reports r
              where r.status = 'RESOLVED'
                and (:hasFrom = false or r.resolved_at >= :from)
                and (:hasTo = false or r.resolved_at <= :to)
            """, nativeQuery = true)
    Double adminAvgResolutionDays(
            @Param("hasFrom") boolean hasFrom,
            @Param("from") java.time.LocalDateTime from,
            @Param("hasTo") boolean hasTo,
            @Param("to") java.time.LocalDateTime to);

    // ✅ Admin count resolved with boolean flags (native query)
    @Query(value = """
              select count(*)
              from reports r
              where r.status = 'RESOLVED'
                and (:hasFrom = false or r.resolved_at >= :from)
                and (:hasTo = false or r.resolved_at <= :to)
            """, nativeQuery = true)
    long adminCountResolved(
            @Param("hasFrom") boolean hasFrom,
            @Param("from") java.time.LocalDateTime from,
            @Param("hasTo") boolean hasTo,
            @Param("to") java.time.LocalDateTime to);

    // Performance by Category
    @Query(value = """
    select 
      r.category as category,
      count(*) as cnt,
      avg(extract(epoch from (r.resolved_at - r.created_at))/86400.0) as avg_days,
      100.0 * avg(
          case 
            when (extract(epoch from (r.resolved_at - r.created_at))/86400.0) <= :slaDays 
            then 1 else 0 
          end
      ) as sla_pct
    from reports r
    where r.status = 'RESOLVED'
      and r.resolved_at >= :fromTs
      and r.resolved_at <= :toTs
      and (:officerId is null or r.officer_id = :officerId)
    group by r.category
    order by cnt desc
""", nativeQuery = true)
    List<Object[]> perfByCategoryNative(
            @Param("fromTs") java.sql.Timestamp fromTs,
            @Param("toTs") java.sql.Timestamp toTs,
            @Param("officerId") Long officerId,
            @Param("slaDays") double slaDays
    );

    // Officer Performance by Outliers
    @Query(value = """
    select r.id as report_id, r.category as category,
           extract(epoch from (r.resolved_at - r.created_at))/86400.0 as days,
           r.created_at
    from reports r
    where r.status = 'RESOLVED'
      and r.resolved_at >= :fromTs
      and r.resolved_at <= :toTs
      and (:officerId is null or r.officer_id = :officerId)
    order by days desc nulls last
    limit :limit
""", nativeQuery = true)
    List<Object[]> slowestResolutionsNative(
            @Param("fromTs") java.sql.Timestamp fromTs,
            @Param("toTs") java.sql.Timestamp toTs,
            @Param("officerId") Long officerId,
            @Param("limit") int limit
    );

    @Query(value = """
    select r.id as report_id, r.category as category,
           extract(epoch from (now() - r.created_at))/86400.0 as age_days,
           r.created_at
    from reports r
    where r.status in ('SUBMITTED','IN_PROGRESS')
      and r.created_at >= :floorTs
      and (:officerId is null or r.officer_id = :officerId)
    order by age_days desc nulls last
    limit :limit
""", nativeQuery = true)
    List<Object[]> oldestOpenNative(
            @Param("floorTs") java.sql.Timestamp floorTs,
            @Param("officerId") Long officerId,
            @Param("limit") int limit
    );

    @Query(value = """
    select 
        r.id as report_id,
        r.category,
        r.status,
        r.created_at,
        r.resolved_at,
        extract(epoch from (r.resolved_at - r.created_at))/86400.0 as resolution_days,
        r.officer_id
    from reports r
    where r.created_at >= :fromTs
      and r.created_at <= :toTs
      and (:officerId is null or r.officer_id = :officerId)
    order by r.created_at desc
""", nativeQuery = true)
    List<Object[]> exportPerformanceData(
            @Param("fromTs") java.sql.Timestamp fromTs,
            @Param("toTs") java.sql.Timestamp toTs,
            @Param("officerId") Long officerId
    );

}



