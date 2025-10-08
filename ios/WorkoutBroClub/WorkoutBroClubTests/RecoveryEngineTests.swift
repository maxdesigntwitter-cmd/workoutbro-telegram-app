import XCTest
import CoreData
@testable import WorkoutBroClub

final class RecoveryEngineTests: XCTestCase {
    var recoveryEngine: RecoveryEngine!
    var context: NSManagedObjectContext!
    var persistenceController: PersistenceController!
    
    override func setUpWithError() throws {
        persistenceController = PersistenceController(inMemory: true)
        context = persistenceController.container.viewContext
        recoveryEngine = RecoveryEngine(context: context)
    }
    
    override func tearDownWithError() throws {
        recoveryEngine = nil
        context = nil
        persistenceController = nil
    }
    
    // MARK: - Sleep Normalization Tests
    
    func testSleepNormalization() throws {
        // Test cases for sleep normalization
        let testCases: [(Double, Double)] = [
            (4.0, 0.0),   // Less than 5 hours
            (5.0, 0.0),   // Exactly 5 hours
            (6.5, 0.5),   // 6.5 hours (middle of range)
            (8.0, 1.0),   // Exactly 8 hours
            (9.0, 1.0),   // More than 8 hours
            (10.0, 1.0)   // Much more than 8 hours
        ]
        
        for (sleepHours, expectedScore) in testCases {
            let recovery = createTestRecovery(sleepHours: sleepHours)
            let score = recoveryEngine.calculateRecoveryScore(for: recovery.date ?? Date())
            
            // Sleep contributes 40% to the total score
            let expectedSleepContribution = expectedScore * 0.40
            XCTAssertGreaterThanOrEqual(score, expectedSleepContribution * 100 - 1, 
                                      "Sleep score for \(sleepHours) hours should be approximately \(expectedSleepContribution * 100)")
        }
    }
    
    // MARK: - HRV Normalization Tests
    
    func testHRVNormalization() throws {
        // Create baseline data with HRV median of 50
        createBaselineHRVData(median: 50.0)
        
        let testCases: [(Double, Double)] = [
            (25.0, 0.5),  // Half of median
            (50.0, 1.0),  // Exactly median
            (75.0, 1.0),  // 1.5x median (capped at 1.0)
            (100.0, 1.0)  // 2x median (capped at 1.0)
        ]
        
        for (currentHRV, expectedRatio) in testCases {
            let recovery = createTestRecovery(hrv: currentHRV)
            let score = recoveryEngine.calculateRecoveryScore(for: recovery.date ?? Date())
            
            // HRV contributes 35% to the total score
            let expectedHRVContribution = expectedRatio * 0.35
            XCTAssertGreaterThanOrEqual(score, expectedHRVContribution * 100 - 1,
                                      "HRV score for \(currentHRV) should be approximately \(expectedHRVContribution * 100)")
        }
    }
    
    // MARK: - Load Normalization Tests
    
    func testLoadNormalization() throws {
        // Create baseline data with load percentiles
        createBaselineLoadData(p75: 1000.0)
        
        let testCases: [(Double, Double)] = [
            (500.0, 0.75),   // Half of p75
            (1000.0, 0.5),   // Exactly p75
            (1500.0, 0.25),  // 1.5x p75
            (2000.0, 0.0)    // 2x p75
        ]
        
        for (currentLoad, expectedScore) in testCases {
            let recovery = createTestRecovery(loadScore: currentLoad)
            let score = recoveryEngine.calculateRecoveryScore(for: recovery.date ?? Date())
            
            // Load contributes 25% to the total score (inverse relationship)
            let expectedLoadContribution = expectedScore * 0.25
            XCTAssertGreaterThanOrEqual(score, expectedLoadContribution * 100 - 1,
                                      "Load score for \(currentLoad) should be approximately \(expectedLoadContribution * 100)")
        }
    }
    
    // MARK: - Complete Recovery Score Tests
    
    func testCompleteRecoveryScore() throws {
        // Create baseline data
        createBaselineHRVData(median: 50.0)
        createBaselineLoadData(p75: 1000.0)
        
        // Test case: Good sleep, good HRV, moderate load
        let recovery = createTestRecovery(
            sleepHours: 8.0,    // 1.0 score
            hrv: 60.0,          // 1.2x median = 1.0 score (capped)
            loadScore: 800.0    // 0.8x p75 = 0.6 score
        )
        
        let score = recoveryEngine.calculateRecoveryScore(for: recovery.date ?? Date())
        
        // Expected: 0.40 * 1.0 + 0.35 * 1.0 + 0.25 * 0.6 = 0.75 = 75%
        let expectedScore = 0.40 * 1.0 + 0.35 * 1.0 + 0.25 * 0.6
        XCTAssertEqual(score, expectedScore * 100, accuracy: 1.0,
                      "Complete recovery score should be approximately \(expectedScore * 100)")
    }
    
    func testRecoveryScoreBounds() throws {
        // Test that recovery score is always between 0 and 100
        createBaselineHRVData(median: 50.0)
        createBaselineLoadData(p75: 1000.0)
        
        // Worst case scenario
        let worstRecovery = createTestRecovery(
            sleepHours: 4.0,    // 0.0 score
            hrv: 10.0,          // Very low HRV
            loadScore: 2000.0   // Very high load
        )
        
        let worstScore = recoveryEngine.calculateRecoveryScore(for: worstRecovery.date ?? Date())
        XCTAssertGreaterThanOrEqual(worstScore, 0.0, "Recovery score should not be negative")
        
        // Best case scenario
        let bestRecovery = createTestRecovery(
            sleepHours: 9.0,    // 1.0 score
            hrv: 100.0,         // High HRV
            loadScore: 200.0    // Low load
        )
        
        let bestScore = recoveryEngine.calculateRecoveryScore(for: bestRecovery.date ?? Date())
        XCTAssertLessThanOrEqual(bestScore, 100.0, "Recovery score should not exceed 100")
    }
    
    // MARK: - Helper Methods
    
    private func createTestRecovery(
        sleepHours: Double = 7.0,
        hrv: Double = 50.0,
        avgHR: Double = 65.0,
        loadScore: Double = 500.0
    ) -> RecoveryDaily {
        let recovery = RecoveryDaily(context: context)
        recovery.id = UUID()
        recovery.date = Date()
        recovery.sleepHours = sleepHours
        recovery.hrv = hrv
        recovery.avgHR = avgHR
        recovery.loadScore = loadScore
        recovery.recoveryScore = 0
        
        try? context.save()
        return recovery
    }
    
    private func createBaselineHRVData(median: Double) {
        // Create 30 days of HRV data with the specified median
        let calendar = Calendar.current
        let today = Date()
        
        for i in 0..<30 {
            let date = calendar.date(byAdding: .day, value: -i, to: today) ?? today
            let recovery = RecoveryDaily(context: context)
            recovery.id = UUID()
            recovery.date = date
            recovery.hrv = median + Double.random(in: -10...10) // Add some variation
            recovery.sleepHours = 7.0
            recovery.avgHR = 65.0
            recovery.loadScore = 500.0
            recovery.recoveryScore = 0
        }
        
        try? context.save()
    }
    
    private func createBaselineLoadData(p75: Double) {
        // Create 30 days of load data with the specified p75
        let calendar = Calendar.current
        let today = Date()
        
        for i in 0..<30 {
            let date = calendar.date(byAdding: .day, value: -i, to: today) ?? today
            let recovery = RecoveryDaily(context: context)
            recovery.id = UUID()
            recovery.date = date
            recovery.loadScore = p75 * Double.random(in: 0.5...1.5) // Add variation around p75
            recovery.sleepHours = 7.0
            recovery.hrv = 50.0
            recovery.avgHR = 65.0
            recovery.recoveryScore = 0
        }
        
        try? context.save()
    }
}

