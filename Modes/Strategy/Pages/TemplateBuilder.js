import * as React from 'react';
import { StyleSheet, Text, ActivityIndicator, View, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import Colors from '../../../colors';
import { useState, useEffect } from 'react';
import ky from 'ky';
import Constants from '../../../constants'
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../CommonComponents/fontScaler';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmbeddedView from '../Components/EmbeddedVis';

const storeData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error(e);
    }
};

const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error(e);
    }
};

export default function TemplateBuilder({ route, navigation }) {
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedData, setSelectedData] = useState("");
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const [dataPoints, setDataPoints] = useState([{label: "(Select a data point)", value: ""}]);
    const [dataLoaded, setDataLoaded] = useState("");
    const [matchData, setMatchData] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const team = route.params.team;
    const event = route.params.event;
    const year = route.params.year;

    async function saveAndReturn() {
        if (selectedSource == "" || selectedData == "") {
            return;
        }
        const dataPoint = selectedData.value;
        const dataType = selectedData.type;
        const dataLabel = selectedData.label;
        const data = {source: selectedSource, value: dataPoint, type: dataType, label: dataLabel, widget: selectedData.widget};
        if (await getData(`visTemplate${year}`) == null) {
            await storeData(`visTemplate${year}`, [data]);
        } else {
            const template = await getData(`visTemplate${year}`);
            template.push(data);
            await storeData(`visTemplate${year}`, template);
        }
        navigation.goBack();
    }

    const sources = [
        {label: "(Select a source)", value: ""},
        {label: "The Blue Alliance", value: "tba"},
        {label: "Pit Forms", value: "pit"},
        {label: "Match Forms", value: "match"},
    ]

    if (selectedSource == "tba" && dataLoaded != "tba") {
        const fetchData = async () => {
            try {
                const data = await ky.get(`${Constants.API_URL}/getTeamMatchData?team=${team}&event=${event}`).json();
                setMatchData(data);
                const dataPoints = [{label: "(Select a data point)", value: ""}];
                const dataTracker = [];
                for (const match of data) {
                    const keys = Object.keys(match);
                    for (const key of keys) {
                        if (!dataTracker.includes(key)) {
                            if (key == "score_breakdown") {
                                const scoreKeys = Object.keys(match[key].blue);
                                for (const scoreKey of scoreKeys) {
                                    if (!dataTracker.includes(scoreKey)) {
                                        dataTracker.push(scoreKey);
                                        let widget;
                                        if (typeof match[key].blue[scoreKey] == "string" || typeof match[key].blue[scoreKey] == "boolean") {
                                            widget = "text";
                                        } else {
                                            widget = "line";
                                        }
                                        dataPoints.push({label: scoreKey, value: `scoreBreakdown/${scoreKey}`, type: typeof match[key].blue[scoreKey], widget: widget});
                                    }
                                }
                            } else {
                                dataTracker.push(key);
                                let widget;
                                if (typeof match[key] == "string" || typeof match[key] == "boolean") {
                                    widget = "text";
                                } else {
                                    widget = "line";
                                }
                                dataPoints.push({label: key, value: key, type: typeof match[key], widget: widget});
                            }
                        }
                    }
                }
                setDataPoints(dataPoints);
                setDataLoaded('tba');
            } catch (error) {
                navigation.navigate('ErrorPage', {error: error.name + '\n' + error.message});
            }
        };
        fetchData();
    }

    if (selectedData != "" && !previewLoaded) {
        const graphData = {
            "title": selectedData.label,
            "type": "line",
            "labels": [],
            "data": []
        }
        for (const match of matchData) {
            let tempMatch = [];
            let tempSelected = [];
            let currentAlliance = '';
            if (match.alliances.blue.team_keys.includes(`frc${team}`)) {
                currentAlliance = 'blue';
            } else {
                currentAlliance = 'red';
            }
            if (selectedData.value.includes('/')) {
                tempMatch = match.score_breakdown[currentAlliance];
                tempSelected = selectedData.value.split('/')[1];
            } else {
                tempMatch = match;
                tempSelected = selectedData.value;
            }
            graphData.labels.push("Qual " + match.match_number);
            graphData.data.push(tempMatch[tempSelected])
        }
        setPreviewData({graphs: [graphData]})
        setPreviewLoaded(true);
    }

    return(
        <View style={styles.rootView}>
            <Text style={styles.text}>Selected: {selectedSource}</Text>
            <Picker
                selectedValue={selectedSource}
                onValueChange={(itemValue, itemIndex) => setSelectedSource(itemValue)}
                dropdownIconColor={Colors.text}
                style={styles.picker}
            >
                {sources.map((item, index) => {
                    return (<Picker.Item label={item.label} value={item.value} key={index}/>) 
                })}
            </Picker>
            <Picker
                selectedValue={selectedData}
                onValueChange={(itemValue, itemIndex) => {setSelectedData(itemValue); setPreviewLoaded(false);}}
                dropdownIconColor={Colors.text}
                style={styles.picker}
            >
                {dataPoints.map((item, index) => {
                    return (<Picker.Item label={item.label + ' -> ' + item.type} value={item} key={index}/>)
                })}
            </Picker>
            <EmbeddedView data={previewData}/>
            <Pressable style={styles.button} onPress={saveAndReturn}><Text style={styles.text}>Add Data Point</Text></Pressable>
        </View>
      )
}

const styles = StyleSheet.create({
    rootView: {
        backgroundColor: Colors.primary,
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 10,
        alignItems: 'center',
        gap: 20
    },
    text: {
        color: Colors.text,
        fontSize: normalize(30),
    },
    picker: {
        color: Colors.text,
        backgroundColor: Colors.secondary,
        width: '90%'
    },
    button: {
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        padding: 10,
        width: '90%',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20
    }
});