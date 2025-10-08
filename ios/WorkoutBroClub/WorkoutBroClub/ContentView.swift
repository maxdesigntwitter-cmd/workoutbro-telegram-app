import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Главная")
                }
                .tag(0)
            
            WorkoutsView()
                .tabItem {
                    Image(systemName: "dumbbell.fill")
                    Text("Тренировки")
                }
                .tag(1)
            
            NutritionView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Питание")
                }
                .tag(2)
            
            RecoveryView()
                .tabItem {
                    Image(systemName: "heart.fill")
                    Text("Восстановление")
                }
                .tag(3)
            
            HistoryView()
                .tabItem {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                    Text("История")
                }
                .tag(4)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Настройки")
                }
                .tag(5)
        }
        .accentColor(.blue)
    }
}

#Preview {
    ContentView()
}