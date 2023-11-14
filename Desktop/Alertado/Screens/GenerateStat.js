import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getFirestore, collection, getDocs } from '@firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { addDays, startOfWeek, startOfMonth } from 'date-fns'; // Import necessary date functions

const GenerateStat = () => {
  const [crimeData, setCrimeData] = useState([]);
  const db = getFirestore();
  const [timeFrame, setTimeFrame] = useState('Daily');
  const [todayReports, setTodayReports] = useState(0);
  const [thisWeekReports, setThisWeekReports] = useState(0);
  const [thisMonthReports, setThisMonthReports] = useState(0);
  const [totalReports, setTotalReports] = useState(0); // Total Reports
  const [totalComplaints, setTotalComplaints] = useState(0); // Total Complaints
  const [totalEmergencies, setTotalEmergencies] = useState(0); // Total Emergencies
  const [totalOngoing, setTotalOngoing] = useState(0); // Total Ongoing
  const [totalCompleted, setTotalCompleted] = useState(0); // Total Completed
  const [totalCancelled, setTotalCancelled] = useState(0); // Total Cancelled
  const [loading, setLoading] = useState(true); // Added loading state
  const [selectedCategory, setSelectedCategory] = useState('Pending'); // Selected category state
  const [totalPendingReports, setTotalPendingReports] = useState(0);
  const [totalPendingComplaints, setTotalPendingComplaints] = useState(0);
  const [totalPendingEmergencies, setTotalPendingEmergencies] = useState(0);
  const [totalOngoingReports, setTotalOngoingReports] = useState(0);
  const [totalOngoingComplaints, setTotalOngoingComplaints] = useState(0);
  const [totalOngoingEmergencies, setTotalOngoingEmergencies] = useState(0);
  const [totalCompletedReports, setTotalCompletedReports] = useState(0);
  const [totalCompletedComplaints, setTotalCompletedComplaints] = useState(0);
  const [totalCompletedEmergencies, setTotalCompletedEmergencies] = useState(0);
  const [totalCancelledReports, setTotalCancelledReports] = useState(0);
  const [totalCancelledComplaints, setTotalCancelledComplaints] = useState(0);
  const [totalCancelledEmergencies, setTotalCancelledEmergencies] = useState(0);

  useEffect(() => {
    const fetchCrimeData = async () => {
      console.log('Fetching crime data...');
      try {
        const reportsCollection = collection(db, 'Reports');
        const complaintsCollection = collection(db, 'Complaints');
        const emergenciesCollection = collection(db, 'Emergencies');
  
        // Fetch data from the Reports collection
        const reportsQuerySnapshot = await getDocs(reportsCollection);
        const reportsData = reportsQuerySnapshot.docs.map((doc) => doc.data());
  
        // Fetch data from the Complaints collection
        const complaintsQuerySnapshot = await getDocs(complaintsCollection);
        const complaintsData = complaintsQuerySnapshot.docs.map((doc) => doc.data());
  
        // Fetch data from the Emergencies collection
        const emergenciesQuerySnapshot = await getDocs(emergenciesCollection);
        const emergenciesData = emergenciesQuerySnapshot.docs.map((doc) => doc.data());
  
        // Calculate the total pending items for each category
        const totalPendingReports = reportsData.filter((report) => report.status === 'Pending').length;
        const totalPendingComplaints = complaintsData.filter((complaint) => complaint.status === 'Pending').length;
        const totalPendingEmergencies = emergenciesData.filter((emergency) => emergency.status === 'Pending').length;
  
        setTotalPendingReports(totalPendingReports);
        setTotalPendingComplaints(totalPendingComplaints);
        setTotalPendingEmergencies(totalPendingEmergencies);
  
        // Calculate the total ongoing, completed, and cancelled items for each category
        const totalOngoingReports = reportsData.filter((report) => report.status === 'Ongoing').length;
        const totalOngoingComplaints = complaintsData.filter((complaint) => complaint.status === 'Ongoing').length;
        const totalOngoingEmergencies = emergenciesData.filter((emergency) => emergency.status === 'Ongoing').length;
        
        setTotalOngoingReports(totalOngoingReports);
        setTotalOngoingComplaints(totalOngoingComplaints);
        setTotalOngoingEmergencies(totalOngoingEmergencies);
  
        const totalCompletedReports = reportsData.filter((report) => report.status === 'Completed').length;
        const totalCompletedComplaints = complaintsData.filter((complaint) => complaint.status === 'Completed').length;
        const totalCompletedEmergencies = emergenciesData.filter((emergency) => emergency.status === 'Completed').length;

        setTotalCompletedReports(totalCompletedReports);
        setTotalCompletedComplaints(totalCompletedComplaints);
        setTotalCompletedEmergencies(totalCompletedEmergencies);
        const totalCancelledReports = reportsData.filter((report) => report.status === 'Cancelled').length;
        const totalCancelledComplaints = complaintsData.filter((complaint) => complaint.status === 'Cancelled').length;
        const totalCancelledEmergencies = emergenciesData.filter((emergency) => emergency.status === 'Cancelled').length;
      
        setTotalCancelledReports(totalCancelledReports);
        setTotalCancelledComplaints(totalCancelledComplaints);
        setTotalCancelledEmergencies(totalCancelledEmergencies);
       
        // Continue with the existing code to calculate other statistics
        const data = reportsData.map((reportData) => {
          return {
            date: convertToDate(reportData.date),
            count: 1,
            barangay: reportData.barangay,
            // ... other fields
          };
        });

        setCrimeData(data);

        const todayReports = data.filter((dataPoint) => {
          const date = dataPoint.date;
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }).length;

        const thisWeekReports = data.filter((dataPoint) => {
          const date = dataPoint.date;
          const startOfWeekDate = startOfWeek(new Date());
          return date >= startOfWeekDate;
        }).length;

        const thisMonthReports = data.filter((dataPoint) => {
          const date = dataPoint.date;
          const startOfMonthDate = startOfMonth(new Date());
          return date >= startOfMonthDate;
        }).length;

        setTodayReports(todayReports);
        setThisWeekReports(thisWeekReports);
        setThisMonthReports(thisMonthReports);

        // Data fetching completed, set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crime data:', error);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    fetchCrimeData();
  }, [timeFrame, db]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  const convertToDate = (dateString) => {
    // Split the date string by "/" and convert to numbers
    const dateParts = dateString.split('/').map(Number);

    // Create a new Date object with the year, month, and day
    const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    return dateObject;
  };

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop:15 }}>
        {`Crime Report - ${timeFrame}`}
      </Text>
      <Picker
        selectedValue={timeFrame}
        onValueChange={(itemValue) => {
          setTimeFrame(itemValue);
        }}
      >
        <Picker.Item label="Daily" value="Daily" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
      </Picker>
      {timeFrame === 'Daily' && (
        <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
          {`Reports for Today: ${todayReports}`}
        </Text>
      )}
      {timeFrame === 'Weekly' && (
        <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
          {`Reports for This Week: ${thisWeekReports}`}
        </Text>
      )}
      {timeFrame === 'Monthly' && (
        <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
          {`Reports for This Month: ${thisMonthReports}`}
        </Text>
      )}
      <Picker
  selectedValue={selectedCategory}
  onValueChange={(itemValue) => {
    setSelectedCategory(itemValue);
  }}
>
  <Picker.Item label="Pending" value="Pending" />
  <Picker.Item label="Completed" value="Completed" />
  <Picker.Item label="Ongoing" value="Ongoing" />
  <Picker.Item label="Cancelled" value="Cancelled" />
</Picker>
      {/* Total Pending */}
      {selectedCategory === 'Pending' && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Total Pending
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
            {`Pending Reports: ${totalPendingReports}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Pending Complaints: ${totalPendingComplaints}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Pending Emergencies: ${totalPendingEmergencies}`}
          </Text>
        </View>
      )}

      {/* Total Ongoing */}
      {selectedCategory === 'Ongoing' && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Total Ongoing
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
            {`Ongoing Reports: ${totalOngoingReports}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Ongoing Complaints: ${totalOngoingComplaints}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Ongoing Emergencies: ${totalOngoingEmergencies}`}
          </Text>
        </View>
      )}

      {/* Total Completed */}
      {selectedCategory === 'Completed' && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Total Completed
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
            {`Completed Reports: ${totalCompletedReports}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Completed Complaints: ${totalCompletedComplaints}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Completed Emergencies: ${totalCompletedEmergencies}`}
          </Text>
        </View>
      )}

      {/* Total Cancelled */}
      {selectedCategory === 'Cancelled' && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Total Cancelled
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold' }}>
            {`Cancelled Reports: ${totalCancelledReports}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Cancelled Complaints: ${totalCancelledComplaints}`}
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'white', paddingVertical: 25, marginHorizontal: 20, borderRadius: 6, fontWeight: 'bold', marginTop: 12 }}>
            {`Cancelled Emergencies: ${totalCancelledEmergencies}`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default GenerateStat;