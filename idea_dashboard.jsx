import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, ReferenceLine, Cell,
} from 'recharts';

// =====================================================================
// DATA — extracted from idea_panel.sqlite (608 raw tables aggregated).
// Ten data tables totalling 568,000+ source rows; what follows is the
// minimum panel needed for the views below.
// =====================================================================



const DATA = {"disabilities":{"AUT":["Autism",true],"DB":["Deaf-blindness",true],"DEAF":["Deafness",true],"DD":["Developmental delay",false],"ED":["Emotional disturbance",true],"HI":["Hearing impairment",true],"ID":["Intellectual disability",true],"MD":["Multiple disabilities",true],"OI":["Orthopedic impairment",true],"OHI":["Other health impairment",true],"SLD":["Specific learning disability",true],"SLI":["Speech or language impairment",true],"TBI":["Traumatic brain injury",true],"VI":["Visual impairment",true],"ALL":["All disabilities",true],"PRE":["Preschool disabled",false]},"environments":{"INSIDE_80_PLUS":["Inside regular class 80% or more of the day","6-21"],"INSIDE_40_79":["Inside regular class 40% through 79% of the day","6-21"],"INSIDE_LT_40":["Inside regular class less than 40% of the day","6-21"],"SEPARATE_SCHOOL":["Separate School","6-21"],"RESIDENTIAL":["Residential Facility","6-21"],"HOMEBOUND":["Homebound/Hospital","6-21"],"CORRECTIONAL":["Correctional Facilities","6-21"],"PARENTAL_PRIVATE":["Parentally Placed in Private Schools","6-21"],"EC_REG_GE10":["Services in Regular Early Childhood Program (>= 10 hours)","3-5"],"EC_REG_LT10":["Services in Regular Early Childhood Program (< 10 hours)","3-5"],"EC_OTHER_GE10":["Services in Other Location (>= 10 hours)","3-5"],"EC_OTHER_LT10":["Services in Other Location (< 10 hours)","3-5"],"SEPARATE_CLASS":["Separate Class","3-5"],"HOME":["Home","3-5"],"SERVICE_PROVIDER":["Service Provider Location","3-5"]},"races":{"AIAN":"American Indian or Alaska Native","BLACK":"Black or African American","HISP":"Hispanic or Latino","WHITE":"White","ASIAN_PI_OMB97":"Asian or Pacific Islander","ASIAN":"Asian","NHPI":"Native Hawaiian or Other Pacific Islander","TWO_PLUS":"Two or more races"},"national":[["1976-77","ALL",3694.0,100.0,8.3],["1976-77","ED",283.0,7.7,0.6],["1976-77","HI",88.0,2.4,0.2],["1976-77","ID",961.0,26.0,2.2],["1976-77","OHI",141.0,3.8,0.3],["1976-77","OI",87.0,2.4,0.2],["1976-77","SLD",796.0,21.5,1.8],["1976-77","SLI",1302.0,35.2,2.9],["1976-77","VI",38.0,1.0,0.1],["1980-81","ALL",4144.0,100.0,10.1],["1980-81","DB",3.0,0.1,null],["1980-81","ED",347.0,8.4,0.8],["1980-81","HI",79.0,1.9,0.2],["1980-81","ID",830.0,20.0,2.0],["1980-81","MD",68.0,1.6,0.2],["1980-81","OHI",98.0,2.4,0.2],["1980-81","OI",58.0,1.4,0.1],["1980-81","SLD",1462.0,35.3,3.6],["1980-81","SLI",1168.0,28.2,2.9],["1980-81","VI",31.0,0.7,0.1],["1990-91","ALL",4710.0,100.0,11.4],["1990-91","DB",1.0,null,null],["1990-91","ED",389.0,8.3,0.9],["1990-91","HI",58.0,1.2,0.1],["1990-91","ID",534.0,11.3,1.3],["1990-91","MD",96.0,2.0,0.2],["1990-91","OHI",55.0,1.2,0.1],["1990-91","OI",49.0,1.0,0.1],["1990-91","PRE",390.0,8.3,0.9],["1990-91","SLD",2129.0,45.2,5.2],["1990-91","SLI",985.0,20.9,2.4],["1990-91","VI",23.0,0.5,0.1],["2000-01","ALL",6296.0,100.0,13.3],["2000-01","AUT",93.0,1.5,0.2],["2000-01","DB",1.0,null,null],["2000-01","DD",213.0,3.4,0.5],["2000-01","ED",480.0,7.6,1.0],["2000-01","HI",77.0,1.2,0.2],["2000-01","ID",624.0,9.9,1.3],["2000-01","MD",131.0,2.1,0.3],["2000-01","OHI",303.0,4.8,0.6],["2000-01","OI",82.0,1.3,0.2],["2000-01","SLD",2860.0,45.4,6.1],["2000-01","SLI",1388.0,22.0,2.9],["2000-01","TBI",16.0,0.2,null],["2000-01","VI",29.0,0.5,0.1],["2008-09","ALL",6483.0,100.0,13.2],["2008-09","AUT",336.0,5.2,0.7],["2008-09","DB",2.0,null,null],["2008-09","DD",354.0,5.5,0.7],["2008-09","ED",420.0,6.5,0.9],["2008-09","HI",78.0,1.2,0.2],["2008-09","ID",478.0,7.4,1.0],["2008-09","MD",130.0,2.0,0.3],["2008-09","OHI",659.0,10.2,1.3],["2008-09","OI",70.0,1.1,0.1],["2008-09","SLD",2476.0,38.2,5.0],["2008-09","SLI",1426.0,22.0,2.9],["2008-09","TBI",26.0,0.4,0.1],["2008-09","VI",29.0,0.4,0.1],["2009-10","ALL",6481.0,100.0,13.1],["2009-10","AUT",378.0,5.8,0.8],["2009-10","DB",2.0,null,null],["2009-10","DD",368.0,5.7,0.7],["2009-10","ED",407.0,6.3,0.8],["2009-10","HI",79.0,1.2,0.2],["2009-10","ID",463.0,7.1,0.9],["2009-10","MD",131.0,2.0,0.3],["2009-10","OHI",689.0,10.6,1.4],["2009-10","OI",65.0,1.0,0.1],["2009-10","SLD",2431.0,37.5,4.9],["2009-10","SLI",1416.0,21.8,2.9],["2009-10","TBI",25.0,0.4,0.1],["2009-10","VI",29.0,0.4,0.1],["2010-11","ALL",6436.0,100.0,13.0],["2010-11","AUT",417.0,6.5,0.8],["2010-11","DB",2.0,null,null],["2010-11","DD",382.0,5.9,0.8],["2010-11","ED",390.0,6.1,0.8],["2010-11","HI",78.0,1.2,0.2],["2010-11","ID",448.0,7.0,0.9],["2010-11","MD",130.0,2.0,0.3],["2010-11","OHI",716.0,11.1,1.4],["2010-11","OI",63.0,1.0,0.1],["2010-11","SLD",2361.0,36.7,4.8],["2010-11","SLI",1396.0,21.7,2.8],["2010-11","TBI",26.0,0.4,0.1],["2010-11","VI",28.0,0.4,0.1],["2011-12","ALL",6401.0,100.0,12.9],["2011-12","AUT",455.0,7.1,0.9],["2011-12","DB",2.0,null,null],["2011-12","DD",393.0,6.1,0.8],["2011-12","ED",373.0,5.8,0.8],["2011-12","HI",78.0,1.2,0.2],["2011-12","ID",435.0,6.8,0.9],["2011-12","MD",132.0,2.1,0.3],["2011-12","OHI",743.0,11.6,1.5],["2011-12","OI",61.0,1.0,0.1],["2011-12","SLD",2303.0,36.0,4.7],["2011-12","SLI",1373.0,21.4,2.8],["2011-12","TBI",26.0,0.4,0.1],["2011-12","VI",28.0,0.4,0.1],["2012-13","ALL",6429.0,100.0,12.9],["2012-13","AUT",498.0,7.8,1.0],["2012-13","DB",1.0,null,null],["2012-13","DD",402.0,6.2,0.8],["2012-13","ED",362.0,5.6,0.7],["2012-13","HI",77.0,1.2,0.2],["2012-13","ID",430.0,6.7,0.9],["2012-13","MD",133.0,2.1,0.3],["2012-13","OHI",779.0,12.1,1.6],["2012-13","OI",59.0,0.9,0.1],["2012-13","SLD",2277.0,35.4,4.6],["2012-13","SLI",1356.0,21.1,2.7],["2012-13","TBI",26.0,0.4,0.1],["2012-13","VI",28.0,0.4,0.1],["2013-14","ALL",6464.0,100.0,12.9],["2013-14","AUT",538.0,8.3,1.1],["2013-14","DB",1.0,null,null],["2013-14","DD",410.0,6.3,0.8],["2013-14","ED",354.0,5.5,0.7],["2013-14","HI",77.0,1.2,0.2],["2013-14","ID",425.0,6.6,0.9],["2013-14","MD",132.0,2.0,0.3],["2013-14","OHI",817.0,12.6,1.6],["2013-14","OI",56.0,0.9,0.1],["2013-14","SLD",2264.0,35.0,4.5],["2013-14","SLI",1334.0,20.6,2.7],["2013-14","TBI",26.0,0.4,0.1],["2013-14","VI",28.0,0.4,0.1],["2014-15","ALL",6555.0,100.0,13.0],["2014-15","AUT",576.0,8.8,1.1],["2014-15","DB",1.0,null,null],["2014-15","DD",419.0,6.4,0.8],["2014-15","ED",349.0,5.3,0.7],["2014-15","HI",76.0,1.2,0.2],["2014-15","ID",423.0,6.4,0.8],["2014-15","MD",132.0,2.0,0.3],["2014-15","OHI",862.0,13.2,1.7],["2014-15","OI",52.0,0.8,0.1],["2014-15","SLD",2278.0,34.8,4.5],["2014-15","SLI",1332.0,20.3,2.6],["2014-15","TBI",26.0,0.4,0.1],["2014-15","VI",28.0,0.4,0.1],["2015-16","ALL",6677.0,100.0,13.2],["2015-16","AUT",617.0,9.2,1.2],["2015-16","DB",1.0,null,null],["2015-16","DD",434.0,6.5,0.9],["2015-16","ED",347.0,5.2,0.7],["2015-16","HI",75.0,1.1,0.1],["2015-16","ID",425.0,6.4,0.8],["2015-16","MD",131.0,2.0,0.3],["2015-16","OHI",909.0,13.6,1.8],["2015-16","OI",47.0,0.7,0.1],["2015-16","SLD",2298.0,34.4,4.6],["2015-16","SLI",1337.0,20.0,2.7],["2015-16","TBI",27.0,0.4,0.1],["2015-16","VI",27.0,0.4,0.1],["2016-17","ALL",6802.0,100.0,13.4],["2016-17","AUT",661.0,9.7,1.3],["2016-17","DB",1.0,null,null],["2016-17","DD",446.0,6.6,0.9],["2016-17","ED",348.0,5.1,0.7],["2016-17","HI",75.0,1.1,0.1],["2016-17","ID",431.0,6.3,0.9],["2016-17","MD",132.0,1.9,0.3],["2016-17","OHI",955.0,14.0,1.9],["2016-17","OI",42.0,0.6,0.1],["2016-17","SLD",2318.0,34.1,4.6],["2016-17","SLI",1337.0,19.7,2.6],["2016-17","TBI",27.0,0.4,0.1],["2016-17","VI",27.0,0.4,0.1],["2017-18","ALL",6964.0,100.0,13.7],["2017-18","AUT",710.0,10.2,1.4],["2017-18","DB",1.0,null,null],["2017-18","DD",461.0,6.6,0.9],["2017-18","ED",353.0,5.1,0.7],["2017-18","HI",75.0,1.1,0.1],["2017-18","ID",436.0,6.3,0.9],["2017-18","MD",132.0,1.9,0.3],["2017-18","OHI",1002.0,14.4,2.0],["2017-18","OI",41.0,0.6,0.1],["2017-18","SLD",2342.0,33.6,4.6],["2017-18","SLI",1357.0,19.5,2.7],["2017-18","TBI",27.0,0.4,0.1],["2017-18","VI",27.0,0.4,0.1],["2018-19","ALL",7134.0,100.0,14.1],["2018-19","AUT",762.0,10.7,1.5],["2018-19","DB",2.0,null,null],["2018-19","DD",479.0,6.7,0.9],["2018-19","ED",358.0,5.0,0.7],["2018-19","HI",74.0,1.0,0.1],["2018-19","ID",439.0,6.2,0.9],["2018-19","MD",133.0,1.9,0.3],["2018-19","OHI",1049.0,14.7,2.1],["2018-19","OI",39.0,0.5,0.1],["2018-19","SLD",2368.0,33.2,4.7],["2018-19","SLI",1378.0,19.3,2.7],["2018-19","TBI",27.0,0.4,0.1],["2018-19","VI",27.0,0.4,0.1],["2019-20","ALL",7282.0,100.0,14.3],["2019-20","AUT",803.0,11.0,1.6],["2019-20","DB",2.0,null,null],["2019-20","DD",502.0,6.9,1.0],["2019-20","ED",365.0,5.0,0.7],["2019-20","HI",73.0,1.0,0.1],["2019-20","ID",442.0,6.1,0.9],["2019-20","MD",133.0,1.8,0.3],["2019-20","OHI",1094.0,15.0,2.2],["2019-20","OI",37.0,0.5,0.1],["2019-20","SLD",2405.0,33.0,4.7],["2019-20","SLI",1374.0,18.9,2.7],["2019-20","TBI",27.0,0.4,0.1],["2019-20","VI",27.0,0.4,0.1],["2020-21","ALL",7183.0,100.0,14.5],["2020-21","AUT",828.0,11.5,1.7],["2020-21","DB",2.0,null,null],["2020-21","DD",487.0,6.8,1.0],["2020-21","ED",353.0,4.9,0.7],["2020-21","HI",72.0,1.0,0.1],["2020-21","ID",429.0,6.0,0.9],["2020-21","MD",128.0,1.8,0.3],["2020-21","OHI",1096.0,15.3,2.2],["2020-21","OI",35.0,0.5,0.1],["2020-21","SLD",2346.0,32.7,4.8],["2020-21","SLI",1357.0,18.9,2.7],["2020-21","TBI",25.0,0.4,0.1],["2020-21","VI",26.0,0.4,0.1],["2021-22","ALL",7259.0,100.0,14.7],["2021-22","AUT",882.0,12.2,1.8],["2021-22","DB",2.0,null,null],["2021-22","DD",487.0,6.7,1.0],["2021-22","ED",334.0,4.6,0.7],["2021-22","HI",71.0,1.0,0.1],["2021-22","ID",426.0,5.9,0.9],["2021-22","MD",125.0,1.7,0.3],["2021-22","OHI",1116.0,15.4,2.3],["2021-22","OI",33.0,0.5,0.1],["2021-22","SLD",2355.0,32.4,4.8],["2021-22","SLI",1378.0,19.0,2.8],["2021-22","TBI",25.0,0.3,0.1],["2021-22","VI",25.0,0.3,0.1],["2022-23","ALL",7526.0,100.0,15.2],["2022-23","AUT",980.0,13.0,2.0],["2022-23","DB",2.0,null,null],["2022-23","DD",518.0,6.9,1.0],["2022-23","ED",327.0,4.3,0.7],["2022-23","HI",70.0,0.9,0.1],["2022-23","ID",434.0,5.8,0.9],["2022-23","MD",126.0,1.7,0.3],["2022-23","OHI",1150.0,15.3,2.3],["2022-23","OI",32.0,0.4,0.1],["2022-23","SLD",2408.0,32.0,4.9],["2022-23","SLI",1430.0,19.0,2.9],["2022-23","TBI",25.0,0.3,null],["2022-23","VI",25.0,0.3,0.1]],"state_pct":[["1990-91","Alabama",94601,null],["1990-91","Alaska",14390,null],["1990-91","Arizona",56629,null],["1990-91","Arkansas",47187,null],["1990-91","California",468420,null],["1990-91","Colorado",56336,null],["1990-91","Connecticut",63886,null],["1990-91","Delaware",14208,null],["1990-91","District of Columbia",6290,null],["1990-91","Florida",234509,null],["1990-91","Georgia",101762,null],["1990-91","Hawaii",12705,null],["1990-91","Idaho",21703,null],["1990-91","Illinois",236060,null],["1990-91","Indiana",112949,null],["1990-91","Iowa",59787,null],["1990-91","Kansas",44785,null],["1990-91","Kentucky",78853,null],["1990-91","Louisiana",72825,null],["1990-91","Maine",27987,null],["1990-91","Maryland",88017,null],["1990-91","Massachusetts",149743,null],["1990-91","Michigan",166511,null],["1990-91","Minnesota",79013,null],["1990-91","Mississippi",60872,null],["1990-91","Missouri",101166,null],["1990-91","Montana",16955,null],["1990-91","Nebraska",32312,null],["1990-91","Nevada",18099,null],["1990-91","New Hampshire",19049,null],["1990-91","New Jersey",178870,null],["1990-91","New Mexico",36000,null],["1990-91","New York",307366,null],["1990-91","North Carolina",122942,null],["1990-91","North Dakota",12294,null],["1990-91","Ohio",205440,null],["1990-91","Oklahoma",65457,null],["1990-91","Oregon",54422,null],["1990-91","Pennsylvania",214254,null],["1990-91","Rhode Island",20646,null],["1990-91","South Carolina",77367,null],["1990-91","South Dakota",14726,null],["1990-91","Tennessee",104853,null],["1990-91","Texas",344529,null],["1990-91","Utah",46606,null],["1990-91","Vermont",12160,null],["1990-91","Virginia",112072,null],["1990-91","Washington",83545,null],["1990-91","West Virginia",42428,null],["1990-91","Wisconsin",85651,null],["1990-91","Wyoming",10852,null],["2000-01","Alabama",99828,null],["2000-01","Alaska",17691,null],["2000-01","Arizona",96442,null],["2000-01","Arkansas",62222,null],["2000-01","California",645287,null],["2000-01","Colorado",78715,null],["2000-01","Connecticut",73886,null],["2000-01","Delaware",16760,null],["2000-01","District of Columbia",10559,null],["2000-01","Florida",367335,null],["2000-01","Georgia",171292,null],["2000-01","Hawaii",23951,null],["2000-01","Idaho",29174,null],["2000-01","Illinois",297316,null],["2000-01","Indiana",156320,null],["2000-01","Iowa",72461,null],["2000-01","Kansas",61267,null],["2000-01","Kentucky",94572,null],["2000-01","Louisiana",97938,null],["2000-01","Maine",35633,null],["2000-01","Maryland",112077,null],["2000-01","Massachusetts",162216,null],["2000-01","Michigan",221456,null],["2000-01","Minnesota",109880,null],["2000-01","Mississippi",62281,null],["2000-01","Missouri",137381,null],["2000-01","Montana",19313,null],["2000-01","Nebraska",42793,null],["2000-01","Nevada",38160,null],["2000-01","New Hampshire",30077,null],["2000-01","New Jersey",221715,null],["2000-01","New Mexico",52256,null],["2000-01","New York",441333,null],["2000-01","North Carolina",173067,null],["2000-01","North Dakota",13652,null],["2000-01","Ohio",237643,null],["2000-01","Oklahoma",85577,null],["2000-01","Oregon",75204,null],["2000-01","Pennsylvania",242655,null],["2000-01","Rhode Island",30727,null],["2000-01","South Carolina",105922,null],["2000-01","South Dakota",16825,null],["2000-01","Tennessee",125863,null],["2000-01","Texas",491642,null],["2000-01","Utah",53921,null],["2000-01","Vermont",13623,null],["2000-01","Virginia",162212,null],["2000-01","Washington",118851,null],["2000-01","West Virginia",50333,null],["2000-01","Wisconsin",125358,null],["2000-01","Wyoming",13154,null],["2010-11","Alabama",82286,null],["2010-11","Alaska",18048,null],["2010-11","Arizona",125816,null],["2010-11","Arkansas",64881,null],["2010-11","California",672174,null],["2010-11","Colorado",84710,null],["2010-11","Connecticut",68167,null],["2010-11","Delaware",18608,null],["2010-11","District of Columbia",11947,null],["2010-11","Florida",368808,null],["2010-11","Georgia",177544,null],["2010-11","Hawaii",19716,null],["2010-11","Idaho",27388,null],["2010-11","Illinois",302830,null],["2010-11","Indiana",166073,null],["2010-11","Iowa",68501,null],["2010-11","Kansas",66873,null],["2010-11","Kentucky",102370,null],["2010-11","Louisiana",82943,null],["2010-11","Maine",32261,null],["2010-11","Maryland",103490,null],["2010-11","Massachusetts",167526,null],["2010-11","Michigan",218957,null],["2010-11","Minnesota",122850,null],["2010-11","Mississippi",64038,null],["2010-11","Missouri",127164,null],["2010-11","Montana",16761,null],["2010-11","Nebraska",44299,null],["2010-11","Nevada",48148,null],["2010-11","New Hampshire",29920,null],["2010-11","New Jersey",232002,null],["2010-11","New Mexico",46628,null],["2010-11","New York",454542,null],["2010-11","North Carolina",185107,null],["2010-11","North Dakota",13170,null],["2010-11","Ohio",259454,null],["2010-11","Oklahoma",97250,null],["2010-11","Oregon",81050,null],["2010-11","Pennsylvania",295080,null],["2010-11","Rhode Island",25332,null],["2010-11","South Carolina",100289,null],["2010-11","South Dakota",18026,null],["2010-11","Tennessee",120263,null],["2010-11","Texas",442019,null],["2010-11","Utah",70278,null],["2010-11","Vermont",13936,null],["2010-11","Virginia",162338,null],["2010-11","Washington",127978,null],["2010-11","West Virginia",45007,null],["2010-11","Wisconsin",124722,null],["2010-11","Wyoming",15348,null],["2015-16","Alabama",84278,11.3],["2015-16","Alaska",18390,13.9],["2015-16","Arizona",132592,12.0],["2015-16","Arkansas",68178,13.9],["2015-16","California",727718,11.5],["2015-16","Colorado",95101,10.6],["2015-16","Connecticut",75030,13.9],["2015-16","Delaware",20742,15.4],["2015-16","District of Columbia",12258,14.6],["2015-16","Florida",372476,13.3],["2015-16","Georgia",202314,11.5],["2015-16","Hawaii",19223,10.6],["2015-16","Idaho",29718,10.2],["2015-16","Illinois",296784,14.5],["2015-16","Indiana",171368,16.4],["2015-16","Iowa",63822,12.6],["2015-16","Kansas",70762,14.3],["2015-16","Kentucky",99283,14.5],["2015-16","Louisiana",84221,11.7],["2015-16","Maine",32531,17.9],["2015-16","Maryland",105440,12.0],["2015-16","Massachusetts",168199,17.4],["2015-16","Michigan",197316,12.8],["2015-16","Minnesota",128218,14.8],["2015-16","Mississippi",66799,13.7],["2015-16","Missouri",126328,13.7],["2015-16","Montana",17387,12.0],["2015-16","Nebraska",47795,15.1],["2015-16","Nevada",55452,11.9],["2015-16","New Hampshire",28806,15.8],["2015-16","New Jersey",232401,16.5],["2015-16","New Mexico",49667,14.8],["2015-16","New York",499551,18.4],["2015-16","North Carolina",198808,12.9],["2015-16","North Dakota",13953,12.8],["2015-16","Ohio",253896,14.8],["2015-16","Oklahoma",108459,15.7],["2015-16","Oregon",84517,13.9],["2015-16","Pennsylvania",303633,17.7],["2015-16","Rhode Island",23515,16.6],["2015-16","South Carolina",101776,13.3],["2015-16","South Dakota",19527,14.5],["2015-16","Tennessee",129386,12.9],["2015-16","Texas",463238,8.7],["2015-16","Utah",79932,12.3],["2015-16","Vermont",13903,15.8],["2015-16","Virginia",164757,12.8],["2015-16","Washington",135757,12.5],["2015-16","West Virginia",45297,16.3],["2015-16","Wisconsin",120864,13.9],["2015-16","Wyoming",15608,16.5],["2018-19","Alabama",93472,12.6],["2018-19","Alaska",19479,14.9],["2018-19","Arizona",144812,12.7],["2018-19","Arkansas",74863,15.1],["2018-19","California",788268,12.6],["2018-19","Colorado",105186,11.5],["2018-19","Connecticut",82336,15.6],["2018-19","Delaware",24382,17.6],["2018-19","District of Columbia",14113,15.9],["2018-19","Florida",405796,14.3],["2018-19","Georgia",219111,12.4],["2018-19","Hawaii",19592,10.8],["2018-19","Idaho",34310,11.0],["2018-19","Illinois",297960,15.0],["2018-19","Indiana",178511,16.9],["2018-19","Iowa",67990,13.2],["2018-19","Kansas",75511,15.2],["2018-19","Kentucky",106158,15.7],["2018-19","Louisiana",86829,12.2],["2018-19","Maine",34382,19.1],["2018-19","Maryland",110563,12.3],["2018-19","Massachusetts",176627,18.4],["2018-19","Michigan",199794,13.3],["2018-19","Minnesota",141454,15.9],["2018-19","Mississippi",69433,14.7],["2018-19","Missouri",132286,14.5],["2018-19","Montana",19380,13.0],["2018-19","Nebraska",52005,15.9],["2018-19","Nevada",60120,12.2],["2018-19","New Hampshire",29920,16.8],["2018-19","New Jersey",241063,17.2],["2018-19","New Mexico",53996,16.2],["2018-19","New York",530702,19.6],["2018-19","North Carolina",201658,13.0],["2018-19","North Dakota",15902,14.0],["2018-19","Ohio",271090,16.0],["2018-19","Oklahoma",115289,16.5],["2018-19","Oregon",89125,14.6],["2018-19","Pennsylvania",327908,18.9],["2018-19","Rhode Island",24170,16.9],["2018-19","South Carolina",106521,13.6],["2018-19","South Dakota",21712,15.6],["2018-19","Tennessee",130229,12.9],["2018-19","Texas",532185,9.8],["2018-19","Utah",86532,12.8],["2018-19","Vermont",14911,17.1],["2018-19","Virginia",175450,13.6],["2018-19","Washington",147628,13.1],["2018-19","West Virginia",47183,17.6],["2018-19","Wisconsin",120864,14.1],["2018-19","Wyoming",15487,16.4],["2019-20","Alabama",96429,13.0],["2019-20","Alaska",19473,14.8],["2019-20","Arizona",148121,12.9],["2019-20","Arkansas",76483,15.4],["2019-20","California",754502,12.1],["2019-20","Colorado",109276,12.0],["2019-20","Connecticut",85010,16.2],["2019-20","Delaware",26060,18.6],["2019-20","District of Columbia",14927,16.6],["2019-20","Florida",420515,14.7],["2019-20","Georgia",225610,12.7],["2019-20","Hawaii",20125,11.1],["2019-20","Idaho",35846,11.5],["2019-20","Illinois",300356,15.5],["2019-20","Indiana",182135,17.3],["2019-20","Iowa",69673,13.5],["2019-20","Kansas",77559,15.6],["2019-20","Kentucky",108475,15.7],["2019-20","Louisiana",89121,12.5],["2019-20","Maine",35020,19.4],["2019-20","Maryland",113714,12.5],["2019-20","Massachusetts",179634,18.7],["2019-20","Michigan",199147,13.3],["2019-20","Minnesota",145888,16.3],["2019-20","Mississippi",70329,15.1],["2019-20","Missouri",132638,14.6],["2019-20","Montana",19645,13.1],["2019-20","Nebraska",52774,16.0],["2019-20","Nevada",63828,12.8],["2019-20","New Hampshire",30400,17.1],["2019-20","New Jersey",246693,17.5],["2019-20","New Mexico",54147,16.3],["2019-20","New York",540245,20.1],["2019-20","North Carolina",203848,13.1],["2019-20","North Dakota",16438,14.1],["2019-20","Ohio",275267,16.3],["2019-20","Oklahoma",116875,16.6],["2019-20","Oregon",91493,15.0],["2019-20","Pennsylvania",339283,19.6],["2019-20","Rhode Island",24548,17.1],["2019-20","South Carolina",108932,13.8],["2019-20","South Dakota",22175,15.8],["2019-20","Tennessee",131408,12.9],["2019-20","Texas",588317,10.7],["2019-20","Utah",87968,12.8],["2019-20","Vermont",15555,17.9],["2019-20","Virginia",179481,13.8],["2019-20","Washington",152495,13.4],["2019-20","West Virginia",47278,17.9],["2019-20","Wisconsin",120864,14.1],["2019-20","Wyoming",15858,16.8],["2020-21","Alabama",95189,13.0],["2020-21","Alaska",18941,14.6],["2020-21","Arizona",144814,13.0],["2020-21","Arkansas",75267,15.5],["2020-21","California",773183,12.7],["2020-21","Colorado",106887,12.1],["2020-21","Connecticut",84155,16.5],["2020-21","Delaware",24672,17.9],["2020-21","District of Columbia",14977,16.7],["2020-21","Florida",409257,14.7],["2020-21","Georgia",222620,12.9],["2020-21","Hawaii",20017,11.3],["2020-21","Idaho",35536,11.6],["2020-21","Illinois",291371,15.4],["2020-21","Indiana",180789,17.5],["2020-21","Iowa",69295,13.7],["2020-21","Kansas",76283,15.8],["2020-21","Kentucky",105779,16.1],["2020-21","Louisiana",86582,12.5],["2020-21","Maine",34482,20.0],["2020-21","Maryland",110944,12.6],["2020-21","Massachusetts",175548,19.0],["2020-21","Michigan",193592,13.5],["2020-21","Minnesota",144492,16.6],["2020-21","Mississippi",67162,15.2],["2020-21","Missouri",126064,14.3],["2020-21","Montana",19156,13.1],["2020-21","Nebraska",52050,16.0],["2020-21","Nevada",62000,12.9],["2020-21","New Hampshire",29199,17.3],["2020-21","New Jersey",237344,17.3],["2020-21","New Mexico",53786,17.0],["2020-21","New York",532943,20.4],["2020-21","North Carolina",193809,12.8],["2020-21","North Dakota",16483,14.3],["2020-21","Ohio",270977,16.5],["2020-21","Oklahoma",115219,16.6],["2020-21","Oregon",87040,15.0],["2020-21","Pennsylvania",338713,19.9],["2020-21","Rhode Island",23949,17.2],["2020-21","South Carolina",106315,13.9],["2020-21","South Dakota",21763,15.6],["2020-21","Tennessee",125097,12.7],["2020-21","Texas",605351,11.3],["2020-21","Utah",85890,12.6],["2020-21","Vermont",15154,18.4],["2020-21","Virginia",174043,13.9],["2020-21","Washington",147202,13.5],["2020-21","West Virginia",45846,18.1],["2020-21","Wisconsin",120348,14.5],["2020-21","Wyoming",15341,16.5],["2021-22","Alabama",94889,12.7],["2021-22","Alaska",18966,14.6],["2021-22","Arizona",145834,12.9],["2021-22","Arkansas",77744,15.9],["2021-22","California",780599,13.1],["2021-22","Colorado",109008,12.4],["2021-22","Connecticut",86103,16.9],["2021-22","Delaware",26355,18.8],["2021-22","District of Columbia",14319,16.1],["2021-22","Florida",420679,14.8],["2021-22","Georgia",224052,12.9],["2021-22","Hawaii",19655,11.3],["2021-22","Idaho",36871,11.7],["2021-22","Illinois",289165,15.5],["2021-22","Indiana",182496,17.6],["2021-22","Iowa",70196,13.7],["2021-22","Kansas",78273,16.1],["2021-22","Kentucky",104938,16.0],["2021-22","Louisiana",86243,12.6],["2021-22","Maine",34883,20.1],["2021-22","Maryland",109574,12.4],["2021-22","Massachusetts",177582,19.3],["2021-22","Michigan",194055,13.5],["2021-22","Minnesota",145936,16.8],["2021-22","Mississippi",67572,15.3],["2021-22","Missouri",125588,14.1],["2021-22","Montana",20014,13.3],["2021-22","Nebraska",53069,16.2],["2021-22","Nevada",61639,12.7],["2021-22","New Hampshire",30309,17.8],["2021-22","New Jersey",238371,17.4],["2021-22","New Mexico",54073,17.1],["2021-22","New York",522078,20.5],["2021-22","North Carolina",195269,12.8],["2021-22","North Dakota",17049,14.6],["2021-22","Ohio",272884,16.2],["2021-22","Oklahoma",117468,16.8],["2021-22","Oregon",85559,14.8],["2021-22","Pennsylvania",342947,20.2],["2021-22","Rhode Island",23846,17.2],["2021-22","South Carolina",109492,14.0],["2021-22","South Dakota",22305,15.8],["2021-22","Tennessee",127179,12.8],["2021-22","Texas",635340,11.7],["2021-22","Utah",88831,12.9],["2021-22","Vermont",15313,18.2],["2021-22","Virginia",172635,13.8],["2021-22","Washington",146751,13.6],["2021-22","West Virginia",46661,18.5],["2021-22","Wisconsin",122844,14.8],["2021-22","Wyoming",15924,17.1],["2022-23","Alabama",99921,13.3],["2022-23","Alaska",19368,14.8],["2022-23","Arizona",149811,13.2],["2022-23","Arkansas",80226,16.3],["2022-23","California",805289,13.6],["2022-23","Colorado",113289,13.0],["2022-23","Connecticut",88635,17.3],["2022-23","Delaware",27502,19.4],["2022-23","District of Columbia",15126,16.6],["2022-23","Florida",432391,15.1],["2022-23","Georgia",230363,13.2],["2022-23","Hawaii",19920,11.7],["2022-23","Idaho",38298,12.1],["2022-23","Illinois",295261,15.9],["2022-23","Indiana",188078,18.2],["2022-23","Iowa",71801,14.0],["2022-23","Kansas",81063,16.6],["2022-23","Kentucky",109749,16.6],["2022-23","Louisiana",96916,13.5],["2022-23","Maine",35828,20.6],["2022-23","Maryland",114732,12.9],["2022-23","Massachusetts",182105,19.7],["2022-23","Michigan",199856,13.9],["2022-23","Minnesota",151845,17.5],["2022-23","Mississippi",69280,15.7],["2022-23","Missouri",127376,14.3],["2022-23","Montana",21112,14.0],["2022-23","Nebraska",55212,16.8],["2022-23","Nevada",64032,13.2],["2022-23","New Hampshire",30917,18.3],["2022-23","New Jersey",243035,17.6],["2022-23","New Mexico",56195,17.8],["2022-23","New York",524993,20.7],["2022-23","North Carolina",202310,13.1],["2022-23","North Dakota",17654,14.9],["2022-23","Ohio",278916,16.6],["2022-23","Oklahoma",120920,17.2],["2022-23","Oregon",87648,15.2],["2022-23","Pennsylvania",357917,21.1],["2022-23","Rhode Island",24650,17.9],["2022-23","South Carolina",112142,14.2],["2022-23","South Dakota",23232,16.4],["2022-23","Tennessee",132339,13.1],["2022-23","Texas",703058,12.7],["2022-23","Utah",91715,13.3],["2022-23","Vermont",15471,18.5],["2022-23","Virginia",177836,14.1],["2022-23","Washington",151949,13.9],["2022-23","West Virginia",46973,18.7],["2022-23","Wisconsin",125334,15.2],["2022-23","Wyoming",16352,17.7]],"state_disability_2022":[["Alabama","ALL",99921],["Alabama","AUT",10929],["Alabama","DB",15],["Alabama","DD",5473],["Alabama","ED",1127],["Alabama","HI",885],["Alabama","ID",7010],["Alabama","MD",1342],["Alabama","OHI",13835],["Alabama","OI",471],["Alabama","SLD",39755],["Alabama","SLI",18348],["Alabama","TBI",236],["Alabama","VI",495],["Alaska","ALL",19368],["Alaska","AUT",1903],["Alaska","DB",3],["Alaska","DD",2282],["Alaska","ED",731],["Alaska","HI",149],["Alaska","ID",538],["Alaska","MD",631],["Alaska","OHI",2735],["Alaska","OI",55],["Alaska","SLD",6959],["Alaska","SLI",3296],["Alaska","TBI",37],["Alaska","VI",49],["Arizona","ALL",149811],["Arizona","AUT",17409],["Arizona","DB",146],["Arizona","DD",17007],["Arizona","ED",6781],["Arizona","HI",1371],["Arizona","ID",7287],["Arizona","MD",1807],["Arizona","OHI",17488],["Arizona","OI",492],["Arizona","SLD",55145],["Arizona","SLI",24140],["Arizona","TBI",227],["Arizona","VI",511],["Arkansas","ALL",80226],["Arkansas","AUT",7109],["Arkansas","DB",10],["Arkansas","DD",6486],["Arkansas","ED",970],["Arkansas","HI",491],["Arkansas","ID",8701],["Arkansas","MD",1410],["Arkansas","OHI",13204],["Arkansas","OI",196],["Arkansas","SLD",20179],["Arkansas","SLI",21063],["Arkansas","TBI",181],["Arkansas","VI",226],["California","ALL",805289],["California","AUT",149127],["California","DB",84],["California","ED",21581],["California","HI",11021],["California","ID",40153],["California","MD",7965],["California","OHI",116346],["California","OI",6583],["California","SLD",279145],["California","SLI",169481],["California","TBI",1305],["California","VI",2498],["Colorado","ALL",113289],["Colorado","AUT",11125],["Colorado","DB",33],["Colorado","DD",11301],["Colorado","ED",4714],["Colorado","HI",1276],["Colorado","ID",2262],["Colorado","MD",4801],["Colorado","OHI",14812],["Colorado","OI",378],["Colorado","SLD",43227],["Colorado","SLI",18625],["Colorado","TBI",398],["Colorado","VI",337],["Connecticut","ALL",88635],["Connecticut","AUT",12566],["Connecticut","DB",13],["Connecticut","DD",5993],["Connecticut","ED",5093],["Connecticut","HI",499],["Connecticut","ID",2782],["Connecticut","MD",2630],["Connecticut","OHI",16806],["Connecticut","OI",26],["Connecticut","SLD",31088],["Connecticut","SLI",10951],["Connecticut","TBI",73],["Connecticut","VI",115],["Delaware","ALL",27502],["Delaware","AUT",3650],["Delaware","DB",48],["Delaware","DD",3093],["Delaware","ED",1117],["Delaware","HI",275],["Delaware","ID",1543],["Delaware","OHI",3669],["Delaware","OI",193],["Delaware","SLD",10787],["Delaware","SLI",2973],["Delaware","TBI",84],["Delaware","VI",70],["District of Columbia","ALL",15126],["District of Columbia","AUT",2040],["District of Columbia","DB",1],["District of Columbia","DD",1301],["District of Columbia","ED",511],["District of Columbia","HI",26],["District of Columbia","ID",720],["District of Columbia","MD",1583],["District of Columbia","OHI",2194],["District of Columbia","OI",21],["District of Columbia","SLD",4597],["District of Columbia","SLI",2090],["District of Columbia","TBI",22],["District of Columbia","VI",20],["Florida","ALL",432391],["Florida","AUT",57638],["Florida","DB",111],["Florida","DD",24745],["Florida","ED",11265],["Florida","HI",4117],["Florida","ID",23519],["Florida","OHI",55241],["Florida","OI",1926],["Florida","SLD",161639],["Florida","SLI",90473],["Florida","TBI",397],["Florida","VI",1320],["Georgia","ALL",230363],["Georgia","AUT",29444],["Georgia","DB",42],["Georgia","DD",27256],["Georgia","ED",8794],["Georgia","HI",1735],["Georgia","ID",16418],["Georgia","OHI",36298],["Georgia","OI",695],["Georgia","SLD",79403],["Georgia","SLI",29172],["Georgia","TBI",385],["Georgia","VI",721],["Hawaii","ALL",19920],["Hawaii","AUT",2428],["Hawaii","DB",3],["Hawaii","DD",2917],["Hawaii","ED",773],["Hawaii","HI",220],["Hawaii","ID",1257],["Hawaii","MD",676],["Hawaii","OHI",3124],["Hawaii","OI",49],["Hawaii","SLD",7405],["Hawaii","SLI",969],["Hawaii","TBI",54],["Hawaii","VI",45],["Idaho","ALL",38298],["Idaho","AUT",4352],["Idaho","DB",13],["Idaho","DD",3884],["Idaho","ED",1281],["Idaho","HI",324],["Idaho","ID",2047],["Idaho","MD",841],["Idaho","OHI",8919],["Idaho","OI",101],["Idaho","SLD",7347],["Idaho","SLI",8964],["Idaho","TBI",107],["Idaho","VI",118],["Illinois","ALL",295261],["Illinois","AUT",32888],["Illinois","DB",34],["Illinois","DD",40423],["Illinois","ED",15589],["Illinois","HI",2779],["Illinois","ID",13421],["Illinois","MD",2945],["Illinois","OHI",40629],["Illinois","OI",760],["Illinois","SLD",94745],["Illinois","SLI",49568],["Illinois","TBI",521],["Illinois","VI",959],["Indiana","ALL",188078],["Indiana","AUT",18728],["Indiana","DB",37],["Indiana","DD",16474],["Indiana","ED",11300],["Indiana","HI",2453],["Indiana","ID",12236],["Indiana","MD",1853],["Indiana","OHI",29771],["Indiana","OI",1259],["Indiana","SLD",52635],["Indiana","SLI",39930],["Indiana","TBI",405],["Indiana","VI",997],["Iowa","ALL",71801],["Kansas","ALL",81063],["Kansas","AUT",5889],["Kansas","DB",17],["Kansas","DD",15323],["Kansas","ED",2291],["Kansas","HI",565],["Kansas","ID",3171],["Kansas","MD",4328],["Kansas","OHI",8570],["Kansas","OI",200],["Kansas","SLD",26752],["Kansas","SLI",13639],["Kansas","TBI",125],["Kansas","VI",193],["Kentucky","ALL",109749],["Kentucky","AUT",10916],["Kentucky","DB",12],["Kentucky","DD",13374],["Kentucky","ED",3910],["Kentucky","HI",674],["Kentucky","ID",13632],["Kentucky","MD",1911],["Kentucky","OHI",16326],["Kentucky","OI",370],["Kentucky","SLD",18256],["Kentucky","SLI",29647],["Kentucky","TBI",164],["Kentucky","VI",557],["Louisiana","ALL",96916],["Louisiana","AUT",8671],["Louisiana","DB",12],["Louisiana","DD",14148],["Louisiana","ED",1700],["Louisiana","HI",1078],["Louisiana","ID",9610],["Louisiana","MD",1117],["Louisiana","OHI",12749],["Louisiana","OI",860],["Louisiana","SLD",30484],["Louisiana","SLI",15740],["Louisiana","TBI",264],["Louisiana","VI",483],["Maine","ALL",35828],["Maine","AUT",4792],["Maine","DB",21],["Maine","DD",651],["Maine","ED",2354],["Maine","HI",151],["Maine","ID",977],["Maine","MD",2597],["Maine","OHI",8310],["Maine","OI",51],["Maine","SLD",9589],["Maine","SLI",6251],["Maine","TBI",38],["Maine","VI",46],["Maryland","ALL",114732],["Maryland","AUT",16054],["Maryland","DB",8],["Maryland","DD",13692],["Maryland","ED",4717],["Maryland","HI",789],["Maryland","ID",5893],["Maryland","MD",7943],["Maryland","OHI",19396],["Maryland","OI",94],["Maryland","SLD",29905],["Maryland","SLI",15779],["Maryland","TBI",196],["Maryland","VI",266],["Massachusetts","ALL",182105],["Massachusetts","AUT",28667],["Massachusetts","DB",188],["Massachusetts","DD",20593],["Massachusetts","ED",16997],["Massachusetts","HI",1125],["Massachusetts","ID",6978],["Massachusetts","MD",1811],["Massachusetts","OHI",27075],["Massachusetts","OI",745],["Massachusetts","SLD",43191],["Massachusetts","SLI",24555],["Massachusetts","TBI",9583],["Massachusetts","VI",597],["Michigan","ALL",199856],["Michigan","AUT",23742],["Michigan","DB",39],["Michigan","DD",6168],["Michigan","ED",10245],["Michigan","HI",2034],["Michigan","ID",15047],["Michigan","MD",2304],["Michigan","OHI",29215],["Michigan","OI",1095],["Michigan","SLD",54345],["Michigan","SLI",54566],["Michigan","TBI",365],["Michigan","VI",691],["Minnesota","ALL",151845],["Minnesota","AUT",24241],["Minnesota","DB",117],["Minnesota","DD",13620],["Minnesota","ED",16206],["Minnesota","HI",2348],["Minnesota","ID",7041],["Minnesota","MD",1626],["Minnesota","OHI",19922],["Minnesota","OI",1574],["Minnesota","SLD",38622],["Minnesota","SLI",25689],["Minnesota","TBI",387],["Minnesota","VI",452],["Mississippi","ALL",69280],["Mississippi","AUT",6653],["Mississippi","DB",11],["Mississippi","DD",6468],["Mississippi","ED",2727],["Mississippi","HI",651],["Mississippi","ID",3676],["Mississippi","MD",1523],["Mississippi","OHI",12131],["Mississippi","OI",290],["Mississippi","SLD",19033],["Mississippi","SLI",15700],["Mississippi","TBI",148],["Mississippi","VI",269],["Missouri","ALL",127376],["Missouri","AUT",16027],["Missouri","DB",24],["Missouri","DD",11822],["Missouri","ED",6404],["Missouri","HI",1105],["Missouri","ID",7900],["Missouri","MD",1300],["Missouri","OHI",26962],["Missouri","OI",373],["Missouri","SLD",30919],["Missouri","SLI",23660],["Missouri","TBI",380],["Missouri","VI",500],["Montana","ALL",21112],["Montana","AUT",1224],["Montana","DB",10],["Montana","DD",1971],["Montana","ED",789],["Montana","HI",74],["Montana","ID",535],["Montana","MD",4391],["Montana","OHI",2177],["Montana","OI",39],["Montana","SLD",6177],["Montana","SLI",3627],["Montana","TBI",44],["Montana","VI",54],["Nebraska","ALL",55212],["Nebraska","AUT",5599],["Nebraska","DB",8],["Nebraska","DD",7030],["Nebraska","ED",2841],["Nebraska","HI",835],["Nebraska","ID",2645],["Nebraska","MD",411],["Nebraska","OHI",7352],["Nebraska","OI",158],["Nebraska","SLD",16601],["Nebraska","SLI",11383],["Nebraska","TBI",176],["Nebraska","VI",173],["Nevada","ALL",64032],["Nevada","AUT",10977],["Nevada","DB",10],["Nevada","DD",4063],["Nevada","ED",1823],["Nevada","HI",563],["Nevada","ID",2226],["Nevada","MD",1152],["Nevada","OHI",6837],["Nevada","OI",311],["Nevada","SLD",26182],["Nevada","SLI",9612],["Nevada","TBI",166],["Nevada","VI",110],["New Hampshire","ALL",30917],["New Hampshire","AUT",3456],["New Hampshire","DB",10],["New Hampshire","DD",4670],["New Hampshire","ED",1774],["New Hampshire","HI",163],["New Hampshire","ID",830],["New Hampshire","MD",393],["New Hampshire","OHI",5788],["New Hampshire","OI",44],["New Hampshire","SLD",10077],["New Hampshire","SLI",3531],["New Hampshire","TBI",80],["New Hampshire","VI",101],["New Jersey","ALL",243035],["New Jersey","AUT",26496],["New Jersey","DB",23],["New Jersey","DD",14715],["New Jersey","ED",6226],["New Jersey","HI",1329],["New Jersey","ID",5363],["New Jersey","MD",12219],["New Jersey","OHI",48505],["New Jersey","OI",292],["New Jersey","SLD",71490],["New Jersey","SLI",55699],["New Jersey","TBI",327],["New Jersey","VI",351],["New Mexico","ALL",56195],["New Mexico","AUT",5050],["New Mexico","DB",9],["New Mexico","DD",5040],["New Mexico","ED",1771],["New Mexico","HI",462],["New Mexico","ID",2317],["New Mexico","MD",765],["New Mexico","OHI",5432],["New Mexico","OI",187],["New Mexico","SLD",25255],["New Mexico","SLI",9498],["New Mexico","TBI",171],["New Mexico","VI",238],["New York","ALL",524993],["New York","AUT",59655],["New York","DB",18],["New York","DD",40846],["New York","ED",16559],["New York","HI",3712],["New York","ID",10877],["New York","MD",12601],["New York","OHI",84757],["New York","OI",1394],["New York","SLD",149184],["New York","SLI",143557],["New York","TBI",673],["New York","VI",1160],["North Carolina","ALL",202310],["North Carolina","AUT",27979],["North Carolina","DB",29],["North Carolina","DD",16039],["North Carolina","ED",4439],["North Carolina","HI",1547],["North Carolina","ID",15194],["North Carolina","MD",2758],["North Carolina","OHI",33777],["North Carolina","OI",497],["North Carolina","SLD",69384],["North Carolina","SLI",29003],["North Carolina","TBI",1068],["North Carolina","VI",596],["North Dakota","ALL",17654],["North Dakota","AUT",1889],["North Dakota","DB",8],["North Dakota","DD",2772],["North Dakota","ED",1269],["North Dakota","HI",135],["North Dakota","ID",708],["North Dakota","OHI",2817],["North Dakota","OI",54],["North Dakota","SLD",4871],["North Dakota","SLI",3023],["North Dakota","TBI",55],["North Dakota","VI",53],["Ohio","ALL",278916],["Ohio","AUT",35285],["Ohio","DB",80],["Ohio","DD",7002],["Ohio","ED",12751],["Ohio","HI",1989],["Ohio","ID",17760],["Ohio","MD",11858],["Ohio","OHI",53532],["Ohio","OI",1317],["Ohio","SLD",96486],["Ohio","SLI",38495],["Ohio","TBI",1478],["Ohio","VI",883],["Oklahoma","ALL",120920],["Oklahoma","AUT",9464],["Oklahoma","DB",30],["Oklahoma","DD",23094],["Oklahoma","ED",3604],["Oklahoma","HI",1446],["Oklahoma","ID",6359],["Oklahoma","MD",1829],["Oklahoma","OHI",20945],["Oklahoma","OI",407],["Oklahoma","SLD",37547],["Oklahoma","SLI",15262],["Oklahoma","TBI",234],["Oklahoma","VI",699],["Oregon","ALL",87648],["Oregon","AUT",12644],["Oregon","DB",40],["Oregon","DD",7444],["Oregon","ED",4763],["Oregon","HI",1091],["Oregon","ID",3680],["Oregon","OHI",14879],["Oregon","OI",680],["Oregon","SLD",22115],["Oregon","SLI",19655],["Oregon","TBI",331],["Oregon","VI",326],["Pennsylvania","ALL",357917],["Pennsylvania","AUT",47997],["Pennsylvania","DB",81],["Pennsylvania","DD",14370],["Pennsylvania","ED",25559],["Pennsylvania","HI",2939],["Pennsylvania","ID",20068],["Pennsylvania","MD",3352],["Pennsylvania","OHI",59610],["Pennsylvania","OI",824],["Pennsylvania","SLD",124753],["Pennsylvania","SLI",56573],["Pennsylvania","TBI",630],["Pennsylvania","VI",1161],["Rhode Island","ALL",24650],["Rhode Island","AUT",2732],["Rhode Island","DB",3],["Rhode Island","DD",3261],["Rhode Island","ED",1339],["Rhode Island","HI",148],["Rhode Island","ID",844],["Rhode Island","MD",431],["Rhode Island","OHI",4123],["Rhode Island","OI",40],["Rhode Island","SLD",7682],["Rhode Island","SLI",3955],["Rhode Island","TBI",41],["Rhode Island","VI",51],["South Carolina","ALL",112142],["South Carolina","AUT",13121],["South Carolina","DB",33],["South Carolina","DD",9837],["South Carolina","ED",1886],["South Carolina","HI",988],["South Carolina","ID",5879],["South Carolina","MD",1555],["South Carolina","OHI",17560],["South Carolina","OI",358],["South Carolina","SLD",41663],["South Carolina","SLI",18662],["South Carolina","TBI",189],["South Carolina","VI",411],["South Dakota","ALL",23232],["South Dakota","AUT",2071],["South Dakota","DB",2],["South Dakota","DD",1215],["South Dakota","ED",1303],["South Dakota","HI",150],["South Dakota","ID",1917],["South Dakota","MD",734],["South Dakota","OHI",3272],["South Dakota","OI",71],["South Dakota","SLD",7411],["South Dakota","SLI",4984],["South Dakota","TBI",51],["South Dakota","VI",51],["Tennessee","ALL",132339],["Tennessee","AUT",17011],["Tennessee","DB",18],["Tennessee","DD",13650],["Tennessee","ED",3224],["Tennessee","HI",1117],["Tennessee","ID",8828],["Tennessee","MD",2076],["Tennessee","OHI",20959],["Tennessee","OI",505],["Tennessee","SLD",33497],["Tennessee","SLI",30681],["Tennessee","TBI",303],["Tennessee","VI",470],["Texas","ALL",703058],["Texas","AUT",112617],["Texas","DB",285],["Texas","ED",39955],["Texas","HI",7118],["Texas","ID",72232],["Texas","MD",6425],["Texas","OHI",89011],["Texas","OI",2885],["Texas","SLD",236406],["Texas","SLI",131745],["Texas","TBI",1086],["Texas","VI",3293],["Utah","ALL",91715],["Utah","AUT",8290],["Utah","DB",26],["Utah","DD",6552],["Utah","ED",1612],["Utah","HI",470],["Utah","ID",3368],["Utah","MD",1454],["Utah","OHI",9685],["Utah","OI",171],["Utah","SLD",35175],["Utah","SLI",24478],["Utah","TBI",193],["Utah","VI",241],["Vermont","ALL",15471],["Vermont","AUT",1261],["Vermont","DB",2],["Vermont","DD",2746],["Vermont","ED",2123],["Vermont","HI",75],["Vermont","ID",608],["Vermont","MD",198],["Vermont","OHI",2850],["Vermont","OI",32],["Vermont","SLD",4299],["Vermont","SLI",1230],["Vermont","TBI",22],["Vermont","VI",25],["Virginia","ALL",177836],["Virginia","AUT",27571],["Virginia","DB",26],["Virginia","DD",13433],["Virginia","ED",8678],["Virginia","HI",1179],["Virginia","ID",8556],["Virginia","MD",2713],["Virginia","OHI",35911],["Virginia","OI",465],["Virginia","SLD",53728],["Virginia","SLI",24685],["Virginia","TBI",363],["Virginia","VI",528],["Washington","ALL",151949],["Washington","AUT",20102],["Washington","DB",21],["Washington","DD",19092],["Washington","ED",4944],["Washington","HI",1191],["Washington","ID",4426],["Washington","MD",3143],["Washington","OHI",28470],["Washington","OI",373],["Washington","SLD",44725],["Washington","SLI",24746],["Washington","TBI",282],["Washington","VI",434],["West Virginia","ALL",46973],["West Virginia","AUT",3391],["West Virginia","DB",24],["West Virginia","DD",2402],["West Virginia","ED",761],["West Virginia","HI",411],["West Virginia","ID",6408],["West Virginia","OHI",7698],["West Virginia","OI",83],["West Virginia","SLD",15548],["West Virginia","SLI",9890],["West Virginia","TBI",73],["West Virginia","VI",284],["Wisconsin","ALL",125334],["Wisconsin","AUT",15409],["Wisconsin","DB",12],["Wisconsin","DD",11602],["Wisconsin","ED",10119],["Wisconsin","HI",1678],["Wisconsin","ID",5863],["Wisconsin","OHI",25735],["Wisconsin","OI",704],["Wisconsin","SLD",25172],["Wisconsin","SLI",28304],["Wisconsin","TBI",272],["Wisconsin","VI",464],["Wyoming","ALL",16352],["Wyoming","AUT",1183],["Wyoming","DB",2],["Wyoming","DD",705],["Wyoming","ED",595],["Wyoming","HI",142],["Wyoming","ID",496],["Wyoming","MD",411],["Wyoming","OHI",2316],["Wyoming","OI",77],["Wyoming","SLD",4473],["Wyoming","SLI",5824],["Wyoming","TBI",68],["Wyoming","VI",60]],"race_disability":[["2005-06","AIAN","ALL",84339],["2005-06","AIAN","AUT",1321],["2005-06","AIAN","DB",16],["2005-06","AIAN","DD",2596],["2005-06","AIAN","ED",6637],["2005-06","AIAN","HI",831],["2005-06","AIAN","ID",6273],["2005-06","AIAN","MD",1555],["2005-06","AIAN","OHI",6335],["2005-06","AIAN","OI",519],["2005-06","AIAN","SLD",43238],["2005-06","AIAN","SLI",14055],["2005-06","AIAN","TBI",232],["2005-06","AIAN","VI",237],["2005-06","ASIAN_PI_OMB97","ALL",128902],["2005-06","ASIAN_PI_OMB97","AUT",10037],["2005-06","ASIAN_PI_OMB97","DB",26],["2005-06","ASIAN_PI_OMB97","DD",1945],["2005-06","ASIAN_PI_OMB97","ED",5360],["2005-06","ASIAN_PI_OMB97","HI",2912],["2005-06","ASIAN_PI_OMB97","ID",10844],["2005-06","ASIAN_PI_OMB97","MD",3325],["2005-06","ASIAN_PI_OMB97","OHI",8287],["2005-06","ASIAN_PI_OMB97","OI",1899],["2005-06","ASIAN_PI_OMB97","SLD",46443],["2005-06","ASIAN_PI_OMB97","SLI",35031],["2005-06","ASIAN_PI_OMB97","TBI",367],["2005-06","ASIAN_PI_OMB97","VI",732],["2005-06","BLACK","ALL",1243474],["2005-06","BLACK","AUT",28410],["2005-06","BLACK","DB",93],["2005-06","BLACK","DD",17468],["2005-06","BLACK","ED",135673],["2005-06","BLACK","HI",11643],["2005-06","BLACK","ID",179534],["2005-06","BLACK","MD",27726],["2005-06","BLACK","OHI",95238],["2005-06","BLACK","OI",9372],["2005-06","BLACK","SLD",552421],["2005-06","BLACK","SLI",177148],["2005-06","BLACK","TBI",2056],["2005-06","BLACK","VI",4355],["2005-06","HISP","ALL",1006197],["2005-06","HISP","AUT",21234],["2005-06","HISP","DB",242],["2005-06","HISP","DD",7312],["2005-06","HISP","ED",50646],["2005-06","HISP","HI",15628],["2005-06","HISP","ID",70123],["2005-06","HISP","MD",17021],["2005-06","HISP","OHI",52567],["2005-06","HISP","OI",12572],["2005-06","HISP","SLD",557885],["2005-06","HISP","SLI",193147],["2005-06","HISP","TBI",2727],["2005-06","HISP","VI",4124],["2005-06","WHITE","ALL",3550334],["2005-06","WHITE","AUT",131429],["2005-06","WHITE","DB",871],["2005-06","WHITE","DD",49105],["2005-06","WHITE","ED",272314],["2005-06","WHITE","HI",39712],["2005-06","WHITE","ID",266084],["2005-06","WHITE","MD",82328],["2005-06","WHITE","OHI",394338],["2005-06","WHITE","OI",37623],["2005-06","WHITE","SLD",1523017],["2005-06","WHITE","SLI",722460],["2005-06","WHITE","TBI",14099],["2005-06","WHITE","VI",14749],["2006-07","AIAN","ALL",84796],["2006-07","AIAN","AUT",1578],["2006-07","AIAN","DB",16],["2006-07","AIAN","DD",2792],["2006-07","AIAN","ED",6690],["2006-07","AIAN","HI",810],["2006-07","AIAN","ID",6137],["2006-07","AIAN","MD",1631],["2006-07","AIAN","OHI",7064],["2006-07","AIAN","OI",496],["2006-07","AIAN","SLD",42261],["2006-07","AIAN","SLI",14330],["2006-07","AIAN","TBI",286],["2006-07","AIAN","VI",256],["2006-07","ASIAN_PI_OMB97","ALL",130809],["2006-07","ASIAN_PI_OMB97","AUT",11823],["2006-07","ASIAN_PI_OMB97","DB",15],["2006-07","ASIAN_PI_OMB97","DD",2115],["2006-07","ASIAN_PI_OMB97","ED",5091],["2006-07","ASIAN_PI_OMB97","HI",3051],["2006-07","ASIAN_PI_OMB97","ID",10698],["2006-07","ASIAN_PI_OMB97","MD",3451],["2006-07","ASIAN_PI_OMB97","OHI",8835],["2006-07","ASIAN_PI_OMB97","OI",1842],["2006-07","ASIAN_PI_OMB97","SLD",45003],["2006-07","ASIAN_PI_OMB97","SLI",35998],["2006-07","ASIAN_PI_OMB97","TBI",366],["2006-07","ASIAN_PI_OMB97","VI",674],["2006-07","BLACK","ALL",1231713],["2006-07","BLACK","AUT",32079],["2006-07","BLACK","DB",76],["2006-07","BLACK","DD",18763],["2006-07","BLACK","ED",131742],["2006-07","BLACK","HI",11611],["2006-07","BLACK","ID",167327],["2006-07","BLACK","MD",27766],["2006-07","BLACK","OHI",103427],["2006-07","BLACK","OI",8918],["2006-07","BLACK","SLD",544686],["2006-07","BLACK","SLI",176633],["2006-07","BLACK","TBI",2501],["2006-07","BLACK","VI",4098],["2006-07","HISP","ALL",1034137],["2006-07","HISP","AUT",25755],["2006-07","HISP","DB",226],["2006-07","HISP","DD",8211],["2006-07","HISP","ED",50719],["2006-07","HISP","HI",16223],["2006-07","HISP","ID",71904],["2006-07","HISP","MD",17552],["2006-07","HISP","OHI",58578],["2006-07","HISP","OI",12791],["2006-07","HISP","SLD",563382],["2006-07","HISP","SLI",200632],["2006-07","HISP","TBI",2744],["2006-07","HISP","VI",4506],["2006-07","WHITE","ALL",3497984],["2006-07","WHITE","AUT",151852],["2006-07","WHITE","DB",777],["2006-07","WHITE","DD",51397],["2006-07","WHITE","ED",262536],["2006-07","WHITE","HI",39204],["2006-07","WHITE","ID",254434],["2006-07","WHITE","MD",82092],["2006-07","WHITE","OHI",416662],["2006-07","WHITE","OI",36564],["2006-07","WHITE","SLD",1455363],["2006-07","WHITE","SLI",715399],["2006-07","WHITE","TBI",14299],["2006-07","WHITE","VI",14809],["2007-08","AIAN","ALL",84074],["2007-08","AIAN","AUT",1824],["2007-08","AIAN","DB",0],["2007-08","AIAN","DD",2928],["2007-08","AIAN","ED",6559],["2007-08","AIAN","HI",771],["2007-08","AIAN","ID",6009],["2007-08","AIAN","MD",1509],["2007-08","AIAN","OHI",7571],["2007-08","AIAN","OI",516],["2007-08","AIAN","SLD",41063],["2007-08","AIAN","SLI",14393],["2007-08","AIAN","TBI",212],["2007-08","AIAN","VI",157],["2007-08","ASIAN_PI_OMB97","ALL",134954],["2007-08","ASIAN_PI_OMB97","AUT",13927],["2007-08","ASIAN_PI_OMB97","DB",26],["2007-08","ASIAN_PI_OMB97","DD",2393],["2007-08","ASIAN_PI_OMB97","ED",4997],["2007-08","ASIAN_PI_OMB97","HI",3157],["2007-08","ASIAN_PI_OMB97","ID",10656],["2007-08","ASIAN_PI_OMB97","MD",3523],["2007-08","ASIAN_PI_OMB97","OHI",9504],["2007-08","ASIAN_PI_OMB97","OI",1911],["2007-08","ASIAN_PI_OMB97","SLD",44462],["2007-08","ASIAN_PI_OMB97","SLI",37211],["2007-08","ASIAN_PI_OMB97","TBI",358],["2007-08","ASIAN_PI_OMB97","VI",729],["2007-08","BLACK","ALL",1207672],["2007-08","BLACK","AUT",36241],["2007-08","BLACK","DB",72],["2007-08","BLACK","DD",19942],["2007-08","BLACK","ED",126295],["2007-08","BLACK","HI",11499],["2007-08","BLACK","ID",155079],["2007-08","BLACK","MD",27325],["2007-08","BLACK","OHI",110906],["2007-08","BLACK","OI",8329],["2007-08","BLACK","SLD",528049],["2007-08","BLACK","SLI",174807],["2007-08","BLACK","TBI",2187],["2007-08","BLACK","VI",3972],["2007-08","HISP","ALL",1056271],["2007-08","HISP","AUT",31574],["2007-08","HISP","DB",191],["2007-08","HISP","DD",9085],["2007-08","HISP","ED",50371],["2007-08","HISP","HI",16527],["2007-08","HISP","ID",72710],["2007-08","HISP","MD",17696],["2007-08","HISP","OHI",64971],["2007-08","HISP","OI",12988],["2007-08","HISP","SLD",564872],["2007-08","HISP","SLI",207113],["2007-08","HISP","TBI",2649],["2007-08","HISP","VI",4522],["2007-08","WHITE","ALL",3395173],["2007-08","WHITE","AUT",171799],["2007-08","WHITE","DB",712],["2007-08","WHITE","DD",53035],["2007-08","WHITE","ED",247650],["2007-08","WHITE","HI",38265],["2007-08","WHITE","ID",240179],["2007-08","WHITE","MD",80414],["2007-08","WHITE","OHI",428548],["2007-08","WHITE","OI",35312],["2007-08","WHITE","SLD",1370627],["2007-08","WHITE","SLI",697385],["2007-08","WHITE","TBI",13668],["2007-08","WHITE","VI",14445],["2008-09","AIAN","ALL",83132],["2008-09","AIAN","AUT",2161],["2008-09","AIAN","DB",6],["2008-09","AIAN","DD",3379],["2008-09","AIAN","ED",6554],["2008-09","AIAN","HI",777],["2008-09","AIAN","ID",5974],["2008-09","AIAN","MD",1493],["2008-09","AIAN","OHI",7911],["2008-09","AIAN","OI",510],["2008-09","AIAN","SLD",39469],["2008-09","AIAN","SLI",14171],["2008-09","AIAN","TBI",167],["2008-09","AIAN","VI",222],["2008-09","ASIAN","ALL",10289],["2008-09","ASIAN","AUT",1122],["2008-09","ASIAN","DB",0],["2008-09","ASIAN","DD",325],["2008-09","ASIAN","ED",162],["2008-09","ASIAN","HI",173],["2008-09","ASIAN","ID",510],["2008-09","ASIAN","MD",764],["2008-09","ASIAN","OHI",828],["2008-09","ASIAN","OI",41],["2008-09","ASIAN","SLD",2717],["2008-09","ASIAN","SLI",3477],["2008-09","ASIAN","TBI",176],["2008-09","ASIAN","VI",47],["2008-09","ASIAN_PI_OMB97","ALL",126091],["2008-09","ASIAN_PI_OMB97","AUT",14984],["2008-09","ASIAN_PI_OMB97","DB",18],["2008-09","ASIAN_PI_OMB97","DD",2231],["2008-09","ASIAN_PI_OMB97","ED",4555],["2008-09","ASIAN_PI_OMB97","HI",3303],["2008-09","ASIAN_PI_OMB97","ID",10113],["2008-09","ASIAN_PI_OMB97","MD",2643],["2008-09","ASIAN_PI_OMB97","OHI",9390],["2008-09","ASIAN_PI_OMB97","OI",1851],["2008-09","ASIAN_PI_OMB97","SLD",41150],["2008-09","ASIAN_PI_OMB97","SLI",33637],["2008-09","ASIAN_PI_OMB97","TBI",263],["2008-09","ASIAN_PI_OMB97","VI",707],["2008-09","BLACK","ALL",1173768],["2008-09","BLACK","AUT",39917],["2008-09","BLACK","DB",227],["2008-09","BLACK","DD",22025],["2008-09","BLACK","ED",119057],["2008-09","BLACK","HI",10936],["2008-09","BLACK","ID",144013],["2008-09","BLACK","MD",24512],["2008-09","BLACK","OHI",115455],["2008-09","BLACK","OI",9640],["2008-09","BLACK","SLD",509328],["2008-09","BLACK","SLI",169409],["2008-09","BLACK","TBI",2908],["2008-09","BLACK","VI",4060],["2008-09","HISP","ALL",1068938],["2008-09","HISP","AUT",37768],["2008-09","HISP","DB",281],["2008-09","HISP","DD",10334],["2008-09","HISP","ED",49402],["2008-09","HISP","HI",16881],["2008-09","HISP","ID",74014],["2008-09","HISP","MD",16792],["2008-09","HISP","OHI",69959],["2008-09","HISP","OI",14209],["2008-09","HISP","SLD",561481],["2008-09","HISP","SLI",209895],["2008-09","HISP","TBI",2721],["2008-09","HISP","VI",4456],["2008-09","NHPI","ALL",246],["2008-09","NHPI","AUT",27],["2008-09","NHPI","DB",0],["2008-09","NHPI","DD",37],["2008-09","NHPI","ED",38],["2008-09","NHPI","HI",9],["2008-09","NHPI","ID",23],["2008-09","NHPI","MD",22],["2008-09","NHPI","OHI",80],["2008-09","NHPI","OI",0],["2008-09","NHPI","SLD",135],["2008-09","NHPI","SLI",42],["2008-09","NHPI","TBI",0],["2008-09","NHPI","VI",0],["2008-09","TWO_PLUS","ALL",4766],["2008-09","TWO_PLUS","AUT",226],["2008-09","TWO_PLUS","DB",0],["2008-09","TWO_PLUS","DD",349],["2008-09","TWO_PLUS","ED",461],["2008-09","TWO_PLUS","HI",11],["2008-09","TWO_PLUS","ID",179],["2008-09","TWO_PLUS","MD",177],["2008-09","TWO_PLUS","OHI",477],["2008-09","TWO_PLUS","OI",37],["2008-09","TWO_PLUS","SLD",1817],["2008-09","TWO_PLUS","SLI",841],["2008-09","TWO_PLUS","TBI",100],["2008-09","WHITE","ALL",3292660],["2008-09","WHITE","AUT",192780],["2008-09","WHITE","DB",621],["2008-09","WHITE","DD",57213],["2008-09","WHITE","ED",233895],["2008-09","WHITE","HI",37152],["2008-09","WHITE","ID",228735],["2008-09","WHITE","MD",75370],["2008-09","WHITE","OHI",434443],["2008-09","WHITE","OI",34623],["2008-09","WHITE","SLD",1298972],["2008-09","WHITE","SLI",667247],["2008-09","WHITE","TBI",14794],["2008-09","WHITE","VI",13929],["2009-10","AIAN","ALL",83482],["2009-10","AIAN","AUT",2536],["2009-10","AIAN","DB",0],["2009-10","AIAN","DD",3570],["2009-10","AIAN","ED",6381],["2009-10","AIAN","HI",749],["2009-10","AIAN","ID",5878],["2009-10","AIAN","MD",1474],["2009-10","AIAN","OHI",8482],["2009-10","AIAN","OI",476],["2009-10","AIAN","SLD",38314],["2009-10","AIAN","SLI",13791],["2009-10","AIAN","TBI",214],["2009-10","AIAN","VI",148],["2009-10","ASIAN","ALL",50365],["2009-10","ASIAN","AUT",8465],["2009-10","ASIAN","DB",17],["2009-10","ASIAN","DD",605],["2009-10","ASIAN","ED",1205],["2009-10","ASIAN","HI",1320],["2009-10","ASIAN","ID",3928],["2009-10","ASIAN","MD",1162],["2009-10","ASIAN","OHI",3015],["2009-10","ASIAN","OI",1089],["2009-10","ASIAN","SLD",13019],["2009-10","ASIAN","SLI",15681],["2009-10","ASIAN","TBI",292],["2009-10","ASIAN","VI",407],["2009-10","ASIAN_PI_OMB97","ALL",86408],["2009-10","ASIAN_PI_OMB97","AUT",9369],["2009-10","ASIAN_PI_OMB97","DB",0],["2009-10","ASIAN_PI_OMB97","DD",2326],["2009-10","ASIAN_PI_OMB97","ED",3366],["2009-10","ASIAN_PI_OMB97","HI",2078],["2009-10","ASIAN_PI_OMB97","ID",6487],["2009-10","ASIAN_PI_OMB97","MD",2264],["2009-10","ASIAN_PI_OMB97","OHI",7595],["2009-10","ASIAN_PI_OMB97","OI",719],["2009-10","ASIAN_PI_OMB97","SLD",28697],["2009-10","ASIAN_PI_OMB97","SLI",21006],["2009-10","ASIAN_PI_OMB97","TBI",147],["2009-10","ASIAN_PI_OMB97","VI",313],["2009-10","BLACK","ALL",1159684],["2009-10","BLACK","AUT",45426],["2009-10","BLACK","DB",73],["2009-10","BLACK","DD",23138],["2009-10","BLACK","ED",114752],["2009-10","BLACK","HI",10856],["2009-10","BLACK","ID",134880],["2009-10","BLACK","MD",24825],["2009-10","BLACK","OHI",122209],["2009-10","BLACK","OI",7825],["2009-10","BLACK","SLD",502401],["2009-10","BLACK","SLI",165234],["2009-10","BLACK","TBI",2827],["2009-10","BLACK","VI",3666],["2009-10","HISP","ALL",1110200],["2009-10","HISP","AUT",46175],["2009-10","HISP","DB",215],["2009-10","HISP","DD",12077],["2009-10","HISP","ED",50471],["2009-10","HISP","HI",17394],["2009-10","HISP","ID",75831],["2009-10","HISP","MD",17549],["2009-10","HISP","OHI",77883],["2009-10","HISP","OI",13346],["2009-10","HISP","SLD",573633],["2009-10","HISP","SLI",216965],["2009-10","HISP","TBI",2820],["2009-10","HISP","VI",4755],["2009-10","NHPI","ALL",3792],["2009-10","NHPI","AUT",238],["2009-10","NHPI","DB",0],["2009-10","NHPI","DD",44],["2009-10","NHPI","ED",179],["2009-10","NHPI","HI",102],["2009-10","NHPI","ID",284],["2009-10","NHPI","MD",84],["2009-10","NHPI","OHI",320],["2009-10","NHPI","OI",73],["2009-10","NHPI","SLD",1574],["2009-10","NHPI","SLI",900],["2009-10","NHPI","TBI",15],["2009-10","NHPI","VI",26],["2009-10","TWO_PLUS","ALL",23223],["2009-10","TWO_PLUS","AUT",1696],["2009-10","TWO_PLUS","DB",5],["2009-10","TWO_PLUS","DD",856],["2009-10","TWO_PLUS","ED",1998],["2009-10","TWO_PLUS","HI",240],["2009-10","TWO_PLUS","ID",1444],["2009-10","TWO_PLUS","MD",338],["2009-10","TWO_PLUS","OHI",2610],["2009-10","TWO_PLUS","OI",219],["2009-10","TWO_PLUS","SLD",8469],["2009-10","TWO_PLUS","SLI",4879],["2009-10","TWO_PLUS","TBI",168],["2009-10","TWO_PLUS","VI",73],["2009-10","WHITE","ALL",3220683],["2009-10","WHITE","AUT",215880],["2009-10","WHITE","DB",766],["2009-10","WHITE","DD",60976],["2009-10","WHITE","ED",223620],["2009-10","WHITE","HI",36263],["2009-10","WHITE","ID",219790],["2009-10","WHITE","MD",74559],["2009-10","WHITE","OHI",445463],["2009-10","WHITE","OI",33040],["2009-10","WHITE","SLD",1242293],["2009-10","WHITE","SLI",645342],["2009-10","WHITE","TBI",15092],["2009-10","WHITE","VI",14213],["2010-11","AIAN","ALL",81977],["2010-11","AIAN","AUT",2671],["2010-11","AIAN","DB",5],["2010-11","AIAN","DD",3493],["2010-11","AIAN","ED",5700],["2010-11","AIAN","HI",648],["2010-11","AIAN","ID",5545],["2010-11","AIAN","MD",1394],["2010-11","AIAN","OHI",8367],["2010-11","AIAN","OI",338],["2010-11","AIAN","SLD",38632],["2010-11","AIAN","SLI",13372],["2010-11","AIAN","TBI",263],["2010-11","AIAN","VI",220],["2010-11","ASIAN","ALL",122707],["2010-11","ASIAN","AUT",18850],["2010-11","ASIAN","DB",20],["2010-11","ASIAN","DD",2201],["2010-11","ASIAN","ED",3256],["2010-11","ASIAN","HI",3455],["2010-11","ASIAN","ID",9295],["2010-11","ASIAN","MD",3167],["2010-11","ASIAN","OHI",8739],["2010-11","ASIAN","OI",1852],["2010-11","ASIAN","SLD",34295],["2010-11","ASIAN","SLI",34764],["2010-11","ASIAN","TBI",426],["2010-11","ASIAN","VI",851],["2010-11","BLACK","ALL",1112710],["2010-11","BLACK","AUT",49636],["2010-11","BLACK","DB",76],["2010-11","BLACK","DD",22990],["2010-11","BLACK","ED",105858],["2010-11","BLACK","HI",10447],["2010-11","BLACK","ID",125417],["2010-11","BLACK","MD",24222],["2010-11","BLACK","OHI",125679],["2010-11","BLACK","OI",6913],["2010-11","BLACK","SLD",476982],["2010-11","BLACK","SLI",156337],["2010-11","BLACK","TBI",2930],["2010-11","BLACK","VI",3260],["2010-11","HISP","ALL",1156998],["2010-11","HISP","AUT",56172],["2010-11","HISP","DB",202],["2010-11","HISP","DD",14646],["2010-11","HISP","ED",51886],["2010-11","HISP","HI",17956],["2010-11","HISP","ID",78656],["2010-11","HISP","MD",18500],["2010-11","HISP","OHI",89233],["2010-11","HISP","OI",13423],["2010-11","HISP","SLD",581863],["2010-11","HISP","SLI",225262],["2010-11","HISP","TBI",3217],["2010-11","HISP","VI",4746],["2010-11","NHPI","ALL",17397],["2010-11","NHPI","AUT",955],["2010-11","NHPI","DB",0],["2010-11","NHPI","DD",705],["2010-11","NHPI","ED",1035],["2010-11","NHPI","HI",317],["2010-11","NHPI","ID",1120],["2010-11","NHPI","MD",322],["2010-11","NHPI","OHI",2194],["2010-11","NHPI","OI",121],["2010-11","NHPI","SLD",7120],["2010-11","NHPI","SLI",2115],["2010-11","NHPI","TBI",47],["2010-11","NHPI","VI",29],["2010-11","TWO_PLUS","ALL",117196],["2010-11","TWO_PLUS","AUT",8359],["2010-11","TWO_PLUS","DB",0],["2010-11","TWO_PLUS","DD",3224],["2010-11","TWO_PLUS","ED",10007],["2010-11","TWO_PLUS","HI",1161],["2010-11","TWO_PLUS","ID",7452],["2010-11","TWO_PLUS","MD",1826],["2010-11","TWO_PLUS","OHI",15702],["2010-11","TWO_PLUS","OI",1005],["2010-11","TWO_PLUS","SLD",43889],["2010-11","TWO_PLUS","SLI",22965],["2010-11","TWO_PLUS","TBI",330],["2010-11","TWO_PLUS","VI",329],["2010-11","WHITE","ALL",3102014],["2010-11","WHITE","AUT",231186],["2010-11","WHITE","DB",681],["2010-11","WHITE","DD",61392],["2010-11","WHITE","ED",208053],["2010-11","WHITE","HI",34652],["2010-11","WHITE","ID",207683],["2010-11","WHITE","MD",72430],["2010-11","WHITE","OHI",445682],["2010-11","WHITE","OI",31059],["2010-11","WHITE","SLD",1167327],["2010-11","WHITE","SLI",612195],["2010-11","WHITE","TBI",14645],["2010-11","WHITE","VI",13183],["2011-12","AIAN","ALL",79844],["2011-12","AIAN","AUT",2886],["2011-12","AIAN","DB",9],["2011-12","AIAN","DD",3585],["2011-12","AIAN","ED",5177],["2011-12","AIAN","HI",580],["2011-12","AIAN","ID",5486],["2011-12","AIAN","MD",1779],["2011-12","AIAN","OHI",8432],["2011-12","AIAN","OI",297],["2011-12","AIAN","SLD",36799],["2011-12","AIAN","SLI",12662],["2011-12","AIAN","TBI",219],["2011-12","AIAN","VI",188],["2011-12","ASIAN","ALL",124674],["2011-12","ASIAN","AUT",20831],["2011-12","ASIAN","DB",25],["2011-12","ASIAN","DD",2331],["2011-12","ASIAN","ED",3047],["2011-12","ASIAN","HI",3623],["2011-12","ASIAN","ID",9401],["2011-12","ASIAN","MD",3298],["2011-12","ASIAN","OHI",9403],["2011-12","ASIAN","OI",1920],["2011-12","ASIAN","SLD",33929],["2011-12","ASIAN","SLI",34354],["2011-12","ASIAN","TBI",419],["2011-12","ASIAN","VI",825],["2011-12","BLACK","ALL",1093628],["2011-12","BLACK","AUT",54554],["2011-12","BLACK","DB",93],["2011-12","BLACK","DD",24913],["2011-12","BLACK","ED",99798],["2011-12","BLACK","HI",10274],["2011-12","BLACK","ID",118646],["2011-12","BLACK","MD",23615],["2011-12","BLACK","OHI",131641],["2011-12","BLACK","OI",6452],["2011-12","BLACK","SLD",463451],["2011-12","BLACK","SLI",151968],["2011-12","BLACK","TBI",3259],["2011-12","BLACK","VI",3575],["2011-12","HISP","ALL",1193928],["2011-12","HISP","AUT",65415],["2011-12","HISP","DB",266],["2011-12","HISP","DD",17021],["2011-12","HISP","ED",51300],["2011-12","HISP","HI",18324],["2011-12","HISP","ID",80691],["2011-12","HISP","MD",19430],["2011-12","HISP","OHI",98437],["2011-12","HISP","OI",13407],["2011-12","HISP","SLD",589569],["2011-12","HISP","SLI",230633],["2011-12","HISP","TBI",3530],["2011-12","HISP","VI",5002],["2011-12","NHPI","ALL",17050],["2011-12","NHPI","AUT",914],["2011-12","NHPI","DB",0],["2011-12","NHPI","DD",679],["2011-12","NHPI","ED",921],["2011-12","NHPI","HI",317],["2011-12","NHPI","ID",1176],["2011-12","NHPI","MD",379],["2011-12","NHPI","OHI",1944],["2011-12","NHPI","OI",121],["2011-12","NHPI","SLD",7280],["2011-12","NHPI","SLI",2067],["2011-12","NHPI","TBI",28],["2011-12","NHPI","VI",24],["2011-12","TWO_PLUS","ALL",134325],["2011-12","TWO_PLUS","AUT",10553],["2011-12","TWO_PLUS","DB",6],["2011-12","TWO_PLUS","DD",3903],["2011-12","TWO_PLUS","ED",11389],["2011-12","TWO_PLUS","HI",1266],["2011-12","TWO_PLUS","ID",8103],["2011-12","TWO_PLUS","MD",2458],["2011-12","TWO_PLUS","OHI",19094],["2011-12","TWO_PLUS","OI",1115],["2011-12","TWO_PLUS","SLD",48979],["2011-12","TWO_PLUS","SLI",25712],["2011-12","TWO_PLUS","TBI",502],["2011-12","TWO_PLUS","VI",346],["2011-12","WHITE","ALL",3027132],["2011-12","WHITE","AUT",248841],["2011-12","WHITE","DB",686],["2011-12","WHITE","DD",62807],["2011-12","WHITE","ED",198032],["2011-12","WHITE","HI",33696],["2011-12","WHITE","ID",198451],["2011-12","WHITE","MD",72530],["2011-12","WHITE","OHI",453715],["2011-12","WHITE","OI",29954],["2011-12","WHITE","SLD",1112907],["2011-12","WHITE","SLI",586020],["2011-12","WHITE","TBI",14086],["2011-12","WHITE","VI",13623],["2012-13","AIAN","ALL",78588],["2012-13","AIAN","AUT",3402],["2012-13","AIAN","DB",22],["2012-13","AIAN","ED",4996],["2012-13","AIAN","HI",730],["2012-13","AIAN","ID",5415],["2012-13","AIAN","MD",1877],["2012-13","AIAN","OHI",8897],["2012-13","AIAN","OI",432],["2012-13","AIAN","SLD",36121],["2012-13","AIAN","SLI",12282],["2012-13","AIAN","TBI",319],["2012-13","AIAN","VI",315],["2012-13","ASIAN","ALL",127808],["2012-13","ASIAN","AUT",22986],["2012-13","ASIAN","DB",48],["2012-13","ASIAN","ED",3182],["2012-13","ASIAN","HI",3711],["2012-13","ASIAN","ID",9789],["2012-13","ASIAN","MD",3562],["2012-13","ASIAN","OHI",10104],["2012-13","ASIAN","OI",1954],["2012-13","ASIAN","SLD",34139],["2012-13","ASIAN","SLI",34178],["2012-13","ASIAN","TBI",612],["2012-13","ASIAN","VI",1040],["2012-13","BLACK","ALL",1086471],["2012-13","BLACK","AUT",59468],["2012-13","BLACK","DB",141],["2012-13","BLACK","ED",95231],["2012-13","BLACK","HI",10033],["2012-13","BLACK","ID",114530],["2012-13","BLACK","MD",23692],["2012-13","BLACK","OHI",139028],["2012-13","BLACK","OI",6303],["2012-13","BLACK","SLD",454553],["2012-13","BLACK","SLI",148886],["2012-13","BLACK","TBI",3843],["2012-13","BLACK","VI",3934],["2012-13","HISP","ALL",1242543],["2012-13","HISP","AUT",75524],["2012-13","HISP","DB",276],["2012-13","HISP","ED",52032],["2012-13","HISP","HI",18768],["2012-13","HISP","ID",83720],["2012-13","HISP","MD",20772],["2012-13","HISP","OHI",109234],["2012-13","HISP","OI",13234],["2012-13","HISP","SLD",603836],["2012-13","HISP","SLI",235974],["2012-13","HISP","TBI",4116],["2012-13","HISP","VI",5380],["2012-13","NHPI","ALL",17445],["2012-13","NHPI","AUT",1042],["2012-13","NHPI","DB",12],["2012-13","NHPI","ED",972],["2012-13","NHPI","HI",358],["2012-13","NHPI","ID",1220],["2012-13","NHPI","MD",423],["2012-13","NHPI","OHI",2032],["2012-13","NHPI","OI",159],["2012-13","NHPI","SLD",8219],["2012-13","NHPI","SLI",2147],["2012-13","NHPI","TBI",74],["2012-13","NHPI","VI",91],["2012-13","TWO_PLUS","ALL",143494],["2012-13","TWO_PLUS","AUT",12354],["2012-13","TWO_PLUS","DB",25],["2012-13","TWO_PLUS","ED",12144],["2012-13","TWO_PLUS","HI",1502],["2012-13","TWO_PLUS","ID",8614],["2012-13","TWO_PLUS","MD",2564],["2012-13","TWO_PLUS","OHI",21438],["2012-13","TWO_PLUS","OI",1218],["2012-13","TWO_PLUS","SLD",51006],["2012-13","TWO_PLUS","SLI",27113],["2012-13","TWO_PLUS","TBI",654],["2012-13","TWO_PLUS","VI",597],["2012-13","WHITE","ALL",2997092],["2012-13","WHITE","AUT",265816],["2012-13","WHITE","DB",757],["2012-13","WHITE","ED",190832],["2012-13","WHITE","HI",32967],["2012-13","WHITE","ID",192409],["2012-13","WHITE","MD",71832],["2012-13","WHITE","OHI",467171],["2012-13","WHITE","OI",28752],["2012-13","WHITE","SLD",1080224],["2012-13","WHITE","SLI",572149],["2012-13","WHITE","TBI",15402],["2012-13","WHITE","VI",13630],["2013-14","AIAN","ALL",77969],["2013-14","AIAN","AUT",3670],["2013-14","AIAN","DB",18],["2013-14","AIAN","ED",4828],["2013-14","AIAN","HI",725],["2013-14","AIAN","ID",5336],["2013-14","AIAN","MD",1867],["2013-14","AIAN","OHI",9142],["2013-14","AIAN","OI",415],["2013-14","AIAN","SLD",35261],["2013-14","AIAN","SLI",11718],["2013-14","AIAN","TBI",328],["2013-14","AIAN","VI",327],["2013-14","ASIAN","ALL",131168],["2013-14","ASIAN","AUT",25217],["2013-14","ASIAN","DB",52],["2013-14","ASIAN","ED",3179],["2013-14","ASIAN","HI",3756],["2013-14","ASIAN","ID",9963],["2013-14","ASIAN","MD",3702],["2013-14","ASIAN","OHI",10803],["2013-14","ASIAN","OI",1960],["2013-14","ASIAN","SLD",34217],["2013-14","ASIAN","SLI",33986],["2013-14","ASIAN","TBI",643],["2013-14","ASIAN","VI",1047],["2013-14","BLACK","ALL",1087988],["2013-14","BLACK","AUT",65430],["2013-14","BLACK","DB",140],["2013-14","BLACK","ED",91552],["2013-14","BLACK","HI",9835],["2013-14","BLACK","ID",111550],["2013-14","BLACK","MD",23117],["2013-14","BLACK","OHI",146413],["2013-14","BLACK","OI",6023],["2013-14","BLACK","SLD",451040],["2013-14","BLACK","SLI",146180],["2013-14","BLACK","TBI",3846],["2013-14","BLACK","VI",3894],["2013-14","HISP","ALL",1298343],["2013-14","HISP","AUT",86765],["2013-14","HISP","DB",296],["2013-14","HISP","ED",52683],["2013-14","HISP","HI",19176],["2013-14","HISP","ID",86969],["2013-14","HISP","MD",21960],["2013-14","HISP","OHI",120625],["2013-14","HISP","OI",13129],["2013-14","HISP","SLD",621468],["2013-14","HISP","SLI",243016],["2013-14","HISP","TBI",4329],["2013-14","HISP","VI",5504],["2013-14","NHPI","ALL",17534],["2013-14","NHPI","AUT",1139],["2013-14","NHPI","DB",10],["2013-14","NHPI","ED",923],["2013-14","NHPI","HI",361],["2013-14","NHPI","ID",1215],["2013-14","NHPI","MD",446],["2013-14","NHPI","OHI",2113],["2013-14","NHPI","OI",146],["2013-14","NHPI","SLD",8230],["2013-14","NHPI","SLI",2139],["2013-14","NHPI","TBI",77],["2013-14","NHPI","VI",92],["2013-14","TWO_PLUS","ALL",159357],["2013-14","TWO_PLUS","AUT",14773],["2013-14","TWO_PLUS","DB",30],["2013-14","TWO_PLUS","ED",13132],["2013-14","TWO_PLUS","HI",1659],["2013-14","TWO_PLUS","ID",9344],["2013-14","TWO_PLUS","MD",2847],["2013-14","TWO_PLUS","OHI",24742],["2013-14","TWO_PLUS","OI",1252],["2013-14","TWO_PLUS","SLD",55571],["2013-14","TWO_PLUS","SLI",29453],["2013-14","TWO_PLUS","TBI",722],["2013-14","TWO_PLUS","VI",674],["2013-14","WHITE","ALL",2962034],["2013-14","WHITE","AUT",279064],["2013-14","WHITE","DB",723],["2013-14","WHITE","ED",184573],["2013-14","WHITE","HI",32002],["2013-14","WHITE","ID",186651],["2013-14","WHITE","MD",70505],["2013-14","WHITE","OHI",481923],["2013-14","WHITE","OI",26984],["2013-14","WHITE","SLD",1049770],["2013-14","WHITE","SLI",551538],["2013-14","WHITE","TBI",15321],["2013-14","WHITE","VI",13450],["2014-15","AIAN","ALL",77798],["2014-15","AIAN","AUT",3977],["2014-15","AIAN","DB",23],["2014-15","AIAN","DD",4509],["2014-15","AIAN","ED",4681],["2014-15","AIAN","HI",739],["2014-15","AIAN","ID",5215],["2014-15","AIAN","MD",1884],["2014-15","AIAN","OHI",9530],["2014-15","AIAN","OI",375],["2014-15","AIAN","SLD",34863],["2014-15","AIAN","SLI",11357],["2014-15","AIAN","TBI",336],["2014-15","AIAN","VI",309],["2014-15","ASIAN","ALL",135332],["2014-15","ASIAN","AUT",27141],["2014-15","ASIAN","DB",48],["2014-15","ASIAN","DD",2848],["2014-15","ASIAN","ED",3169],["2014-15","ASIAN","HI",3738],["2014-15","ASIAN","ID",10043],["2014-15","ASIAN","MD",3855],["2014-15","ASIAN","OHI",11544],["2014-15","ASIAN","OI",1955],["2014-15","ASIAN","SLD",34760],["2014-15","ASIAN","SLI",34496],["2014-15","ASIAN","TBI",634],["2014-15","ASIAN","VI",1101],["2014-15","BLACK","ALL",1097252],["2014-15","BLACK","AUT",71106],["2014-15","BLACK","DB",135],["2014-15","BLACK","DD",30583],["2014-15","BLACK","ED",88054],["2014-15","BLACK","HI",9710],["2014-15","BLACK","ID",109321],["2014-15","BLACK","MD",22638],["2014-15","BLACK","OHI",154799],["2014-15","BLACK","OI",5696],["2014-15","BLACK","SLD",450763],["2014-15","BLACK","SLI",146722],["2014-15","BLACK","TBI",3859],["2014-15","BLACK","VI",3866],["2014-15","HISP","ALL",1359140],["2014-15","HISP","AUT",98120],["2014-15","HISP","DB",290],["2014-15","HISP","DD",24496],["2014-15","HISP","ED",53478],["2014-15","HISP","HI",19449],["2014-15","HISP","ID",90134],["2014-15","HISP","MD",22515],["2014-15","HISP","OHI",134118],["2014-15","HISP","OI",12290],["2014-15","HISP","SLD",643058],["2014-15","HISP","SLI",251055],["2014-15","HISP","TBI",4482],["2014-15","HISP","VI",5655],["2014-15","NHPI","ALL",17873],["2014-15","NHPI","AUT",1308],["2014-15","NHPI","DB",8],["2014-15","NHPI","DD",643],["2014-15","NHPI","ED",873],["2014-15","NHPI","HI",351],["2014-15","NHPI","ID",1294],["2014-15","NHPI","MD",467],["2014-15","NHPI","OHI",2242],["2014-15","NHPI","OI",133],["2014-15","NHPI","SLD",8247],["2014-15","NHPI","SLI",2143],["2014-15","NHPI","TBI",78],["2014-15","NHPI","VI",86],["2014-15","TWO_PLUS","ALL",178104],["2014-15","TWO_PLUS","AUT",17441],["2014-15","TWO_PLUS","DB",34],["2014-15","TWO_PLUS","DD",6129],["2014-15","TWO_PLUS","ED",14339],["2014-15","TWO_PLUS","HI",1825],["2014-15","TWO_PLUS","ID",10299],["2014-15","TWO_PLUS","MD",3186],["2014-15","TWO_PLUS","OHI",28556],["2014-15","TWO_PLUS","OI",1239],["2014-15","TWO_PLUS","SLD",61247],["2014-15","TWO_PLUS","SLI",32301],["2014-15","TWO_PLUS","TBI",803],["2014-15","TWO_PLUS","VI",705],["2014-15","WHITE","ALL",2954032],["2014-15","WHITE","AUT",290727],["2014-15","WHITE","DB",680],["2014-15","WHITE","DD",72086],["2014-15","WHITE","ED",181342],["2014-15","WHITE","HI",31268],["2014-15","WHITE","ID",182213],["2014-15","WHITE","MD",69634],["2014-15","WHITE","OHI",498540],["2014-15","WHITE","OI",24177],["2014-15","WHITE","SLD",1034594],["2014-15","WHITE","SLI",540430],["2014-15","WHITE","TBI",15142],["2014-15","WHITE","VI",13199],["2015-16","AIAN","ALL",79579],["2015-16","AIAN","AUT",4372],["2015-16","AIAN","DB",17],["2015-16","AIAN","DD",4717],["2015-16","AIAN","ED",4692],["2015-16","AIAN","HI",721],["2015-16","AIAN","ID",5277],["2015-16","AIAN","MD",1911],["2015-16","AIAN","OHI",10005],["2015-16","AIAN","OI",339],["2015-16","AIAN","SLD",35203],["2015-16","AIAN","SLI",11677],["2015-16","AIAN","TBI",334],["2015-16","AIAN","VI",314],["2015-16","ASIAN","ALL",139914],["2015-16","ASIAN","AUT",29530],["2015-16","ASIAN","DB",51],["2015-16","ASIAN","DD",3103],["2015-16","ASIAN","ED",3285],["2015-16","ASIAN","HI",3742],["2015-16","ASIAN","ID",10259],["2015-16","ASIAN","MD",4006],["2015-16","ASIAN","OHI",12468],["2015-16","ASIAN","OI",1838],["2015-16","ASIAN","SLD",34906],["2015-16","ASIAN","SLI",35052],["2015-16","ASIAN","TBI",639],["2015-16","ASIAN","VI",1035],["2015-16","BLACK","ALL",1106786],["2015-16","BLACK","AUT",77358],["2015-16","BLACK","DB",159],["2015-16","BLACK","DD",31915],["2015-16","BLACK","ED",85676],["2015-16","BLACK","HI",9523],["2015-16","BLACK","ID",108883],["2015-16","BLACK","MD",22015],["2015-16","BLACK","OHI",163368],["2015-16","BLACK","OI",5209],["2015-16","BLACK","SLD",449942],["2015-16","BLACK","SLI",145071],["2015-16","BLACK","TBI",3945],["2015-16","BLACK","VI",3722],["2015-16","HISP","ALL",1424611],["2015-16","HISP","AUT",110347],["2015-16","HISP","DB",280],["2015-16","HISP","DD",26801],["2015-16","HISP","ED",55092],["2015-16","HISP","HI",19692],["2015-16","HISP","ID",94645],["2015-16","HISP","MD",22856],["2015-16","HISP","OHI",149516],["2015-16","HISP","OI",11243],["2015-16","HISP","SLD",666249],["2015-16","HISP","SLI",257783],["2015-16","HISP","TBI",4657],["2015-16","HISP","VI",5450],["2015-16","NHPI","ALL",17977],["2015-16","NHPI","AUT",1366],["2015-16","NHPI","DB",4],["2015-16","NHPI","DD",623],["2015-16","NHPI","ED",870],["2015-16","NHPI","HI",363],["2015-16","NHPI","ID",1369],["2015-16","NHPI","MD",485],["2015-16","NHPI","OHI",2220],["2015-16","NHPI","OI",124],["2015-16","NHPI","SLD",8230],["2015-16","NHPI","SLI",2163],["2015-16","NHPI","TBI",76],["2015-16","NHPI","VI",84],["2015-16","TWO_PLUS","ALL",194994],["2015-16","TWO_PLUS","AUT",19794],["2015-16","TWO_PLUS","DB",48],["2015-16","TWO_PLUS","DD",7001],["2015-16","TWO_PLUS","ED",15563],["2015-16","TWO_PLUS","HI",1910],["2015-16","TWO_PLUS","ID",10958],["2015-16","TWO_PLUS","MD",3567],["2015-16","TWO_PLUS","OHI",32399],["2015-16","TWO_PLUS","OI",1137],["2015-16","TWO_PLUS","SLD",66780],["2015-16","TWO_PLUS","SLI",34210],["2015-16","TWO_PLUS","TBI",863],["2015-16","TWO_PLUS","VI",764],["2015-16","WHITE","ALL",2966615],["2015-16","WHITE","AUT",303075],["2015-16","WHITE","DB",696],["2015-16","WHITE","DD",74509],["2015-16","WHITE","ED",179431],["2015-16","WHITE","HI",30697],["2015-16","WHITE","ID",180398],["2015-16","WHITE","MD",68987],["2015-16","WHITE","OHI",516493],["2015-16","WHITE","OI",20983],["2015-16","WHITE","SLD",1028756],["2015-16","WHITE","SLI",534727],["2015-16","WHITE","TBI",14904],["2015-16","WHITE","VI",12959],["2016-17","AIAN","ALL",77436],["2016-17","AIAN","AUT",4433],["2016-17","AIAN","DB",20],["2016-17","AIAN","DD",4945],["2016-17","AIAN","ED",4316],["2016-17","AIAN","HI",702],["2016-17","AIAN","ID",5151],["2016-17","AIAN","MD",1909],["2016-17","AIAN","OHI",9714],["2016-17","AIAN","OI",313],["2016-17","AIAN","SLD",34315],["2016-17","AIAN","SLI",10979],["2016-17","AIAN","TBI",320],["2016-17","AIAN","VI",319],["2016-17","ASIAN","ALL",142416],["2016-17","ASIAN","AUT",31901],["2016-17","ASIAN","DB",50],["2016-17","ASIAN","DD",3474],["2016-17","ASIAN","ED",3254],["2016-17","ASIAN","HI",3636],["2016-17","ASIAN","ID",10206],["2016-17","ASIAN","MD",4140],["2016-17","ASIAN","OHI",13044],["2016-17","ASIAN","OI",1792],["2016-17","ASIAN","SLD",34722],["2016-17","ASIAN","SLI",34423],["2016-17","ASIAN","TBI",670],["2016-17","ASIAN","VI",1104],["2016-17","BLACK","ALL",1100897],["2016-17","BLACK","AUT",83119],["2016-17","BLACK","DB",165],["2016-17","BLACK","DD",32023],["2016-17","BLACK","ED",82546],["2016-17","BLACK","HI",9225],["2016-17","BLACK","ID",107784],["2016-17","BLACK","MD",21980],["2016-17","BLACK","OHI",166566],["2016-17","BLACK","OI",4714],["2016-17","BLACK","SLD",444716],["2016-17","BLACK","SLI",140499],["2016-17","BLACK","TBI",3840],["2016-17","BLACK","VI",3720],["2016-17","HISP","ALL",1481868],["2016-17","HISP","AUT",123431],["2016-17","HISP","DB",307],["2016-17","HISP","DD",28938],["2016-17","HISP","ED",56435],["2016-17","HISP","HI",19893],["2016-17","HISP","ID",98337],["2016-17","HISP","MD",23597],["2016-17","HISP","OHI",163199],["2016-17","HISP","OI",10229],["2016-17","HISP","SLD",687837],["2016-17","HISP","SLI",259158],["2016-17","HISP","TBI",4819],["2016-17","HISP","VI",5687],["2016-17","NHPI","ALL",18090],["2016-17","NHPI","AUT",1446],["2016-17","NHPI","DB",3],["2016-17","NHPI","DD",634],["2016-17","NHPI","ED",818],["2016-17","NHPI","HI",345],["2016-17","NHPI","ID",1430],["2016-17","NHPI","MD",507],["2016-17","NHPI","OHI",2293],["2016-17","NHPI","OI",121],["2016-17","NHPI","SLD",8199],["2016-17","NHPI","SLI",2136],["2016-17","NHPI","TBI",77],["2016-17","NHPI","VI",81],["2016-17","TWO_PLUS","ALL",211969],["2016-17","TWO_PLUS","AUT",22494],["2016-17","TWO_PLUS","DB",44],["2016-17","TWO_PLUS","DD",7893],["2016-17","TWO_PLUS","ED",16024],["2016-17","TWO_PLUS","HI",2018],["2016-17","TWO_PLUS","ID",11863],["2016-17","TWO_PLUS","MD",3857],["2016-17","TWO_PLUS","OHI",36300],["2016-17","TWO_PLUS","OI",1061],["2016-17","TWO_PLUS","SLD",72388],["2016-17","TWO_PLUS","SLI",36367],["2016-17","TWO_PLUS","TBI",914],["2016-17","TWO_PLUS","VI",746],["2016-17","WHITE","ALL",2899113],["2016-17","WHITE","AUT",306762],["2016-17","WHITE","DB",672],["2016-17","WHITE","DD",75482],["2016-17","WHITE","ED",170038],["2016-17","WHITE","HI",28897],["2016-17","WHITE","ID",174809],["2016-17","WHITE","MD",68549],["2016-17","WHITE","OHI",519578],["2016-17","WHITE","OI",17699],["2016-17","WHITE","SLD",999013],["2016-17","WHITE","SLI",510642],["2016-17","WHITE","TBI",14496],["2016-17","WHITE","VI",12468],["2017-18","AIAN","ALL",77689],["2017-18","AIAN","AUT",4738],["2017-18","AIAN","DB",22],["2017-18","AIAN","DD",4941],["2017-18","AIAN","ED",4195],["2017-18","AIAN","HI",715],["2017-18","AIAN","ID",5184],["2017-18","AIAN","MD",1841],["2017-18","AIAN","OHI",10139],["2017-18","AIAN","OI",283],["2017-18","AIAN","SLD",33938],["2017-18","AIAN","SLI",11061],["2017-18","AIAN","TBI",313],["2017-18","AIAN","VI",319],["2017-18","ASIAN","ALL",149292],["2017-18","ASIAN","AUT",35256],["2017-18","ASIAN","DB",60],["2017-18","ASIAN","DD",3824],["2017-18","ASIAN","ED",3429],["2017-18","ASIAN","HI",3730],["2017-18","ASIAN","ID",10451],["2017-18","ASIAN","MD",4295],["2017-18","ASIAN","OHI",13910],["2017-18","ASIAN","OI",1759],["2017-18","ASIAN","SLD",35348],["2017-18","ASIAN","SLI",35407],["2017-18","ASIAN","TBI",670],["2017-18","ASIAN","VI",1153],["2017-18","BLACK","ALL",1113210],["2017-18","BLACK","AUT",90544],["2017-18","BLACK","DB",166],["2017-18","BLACK","DD",32773],["2017-18","BLACK","ED",81519],["2017-18","BLACK","HI",8938],["2017-18","BLACK","ID",108442],["2017-18","BLACK","MD",21656],["2017-18","BLACK","OHI",174856],["2017-18","BLACK","OI",4520],["2017-18","BLACK","SLD",443427],["2017-18","BLACK","SLI",138824],["2017-18","BLACK","TBI",3911],["2017-18","BLACK","VI",3632],["2017-18","HISP","ALL",1549963],["2017-18","HISP","AUT",138032],["2017-18","HISP","DB",314],["2017-18","HISP","DD",31176],["2017-18","HISP","ED",58920],["2017-18","HISP","HI",20164],["2017-18","HISP","ID",102171],["2017-18","HISP","MD",24081],["2017-18","HISP","OHI",178081],["2017-18","HISP","OI",9957],["2017-18","HISP","SLD",710299],["2017-18","HISP","SLI",266145],["2017-18","HISP","TBI",4959],["2017-18","HISP","VI",5662],["2017-18","NHPI","ALL",18115],["2017-18","NHPI","AUT",1543],["2017-18","NHPI","DB",4],["2017-18","NHPI","DD",666],["2017-18","NHPI","ED",800],["2017-18","NHPI","HI",340],["2017-18","NHPI","ID",1440],["2017-18","NHPI","MD",503],["2017-18","NHPI","OHI",2289],["2017-18","NHPI","OI",114],["2017-18","NHPI","SLD",8139],["2017-18","NHPI","SLI",2128],["2017-18","NHPI","TBI",70],["2017-18","NHPI","VI",79],["2017-18","TWO_PLUS","ALL",229997],["2017-18","TWO_PLUS","AUT",25072],["2017-18","TWO_PLUS","DB",39],["2017-18","TWO_PLUS","DD",8422],["2017-18","TWO_PLUS","ED",17266],["2017-18","TWO_PLUS","HI",2089],["2017-18","TWO_PLUS","ID",12571],["2017-18","TWO_PLUS","MD",4088],["2017-18","TWO_PLUS","OHI",40519],["2017-18","TWO_PLUS","OI",1081],["2017-18","TWO_PLUS","SLD",78077],["2017-18","TWO_PLUS","SLI",39022],["2017-18","TWO_PLUS","TBI",942],["2017-18","TWO_PLUS","VI",807],["2017-18","WHITE","ALL",2886222],["2017-18","WHITE","AUT",315806],["2017-18","WHITE","DB",684],["2017-18","WHITE","DD",77078],["2017-18","WHITE","ED",167199],["2017-18","WHITE","HI",28154],["2017-18","WHITE","ID",172338],["2017-18","WHITE","MD",64755],["2017-18","WHITE","OHI",527614],["2017-18","WHITE","OI",16844],["2017-18","WHITE","SLD",981853],["2017-18","WHITE","SLI",507238],["2017-18","WHITE","TBI",14388],["2017-18","WHITE","VI",12246],["2018-19","AIAN","ALL",78960],["2018-19","AIAN","AUT",5064],["2018-19","AIAN","DB",17],["2018-19","AIAN","DD",5059],["2018-19","AIAN","ED",4348],["2018-19","AIAN","HI",726],["2018-19","AIAN","ID",5275],["2018-19","AIAN","MD",1878],["2018-19","AIAN","OHI",10417],["2018-19","AIAN","OI",267],["2018-19","AIAN","SLD",34098],["2018-19","AIAN","SLI",11158],["2018-19","AIAN","TBI",313],["2018-19","AIAN","VI",340],["2018-19","ASIAN","ALL",156797],["2018-19","ASIAN","AUT",38815],["2018-19","ASIAN","DB",73],["2018-19","ASIAN","DD",4168],["2018-19","ASIAN","ED",3625],["2018-19","ASIAN","HI",3825],["2018-19","ASIAN","ID",10653],["2018-19","ASIAN","MD",4458],["2018-19","ASIAN","OHI",14771],["2018-19","ASIAN","OI",1775],["2018-19","ASIAN","SLD",36028],["2018-19","ASIAN","SLI",36767],["2018-19","ASIAN","TBI",683],["2018-19","ASIAN","VI",1154],["2018-19","BLACK","ALL",1128812],["2018-19","BLACK","AUT",98217],["2018-19","BLACK","DB",164],["2018-19","BLACK","DD",33879],["2018-19","BLACK","ED",80576],["2018-19","BLACK","HI",8663],["2018-19","BLACK","ID",109297],["2018-19","BLACK","MD",21689],["2018-19","BLACK","OHI",182648],["2018-19","BLACK","OI",4224],["2018-19","BLACK","SLD",443429],["2018-19","BLACK","SLI",138469],["2018-19","BLACK","TBI",3919],["2018-19","BLACK","VI",3637],["2018-19","HISP","ALL",1624808],["2018-19","HISP","AUT",154258],["2018-19","HISP","DB",335],["2018-19","HISP","DD",32709],["2018-19","HISP","ED",61910],["2018-19","HISP","HI",20366],["2018-19","HISP","ID",106366],["2018-19","HISP","MD",25171],["2018-19","HISP","OHI",194811],["2018-19","HISP","OI",9638],["2018-19","HISP","SLD",734043],["2018-19","HISP","SLI",274430],["2018-19","HISP","TBI",5132],["2018-19","HISP","VI",5633],["2018-19","NHPI","ALL",18489],["2018-19","NHPI","AUT",1713],["2018-19","NHPI","DB",4],["2018-19","NHPI","DD",686],["2018-19","NHPI","ED",778],["2018-19","NHPI","HI",315],["2018-19","NHPI","ID",1470],["2018-19","NHPI","MD",527],["2018-19","NHPI","OHI",2349],["2018-19","NHPI","OI",112],["2018-19","NHPI","SLD",8125],["2018-19","NHPI","SLI",2263],["2018-19","NHPI","TBI",61],["2018-19","NHPI","VI",85],["2018-19","TWO_PLUS","ALL",251266],["2018-19","TWO_PLUS","AUT",28673],["2018-19","TWO_PLUS","DB",46],["2018-19","TWO_PLUS","DD",8872],["2018-19","TWO_PLUS","ED",19023],["2018-19","TWO_PLUS","HI",2138],["2018-19","TWO_PLUS","ID",13372],["2018-19","TWO_PLUS","MD",4520],["2018-19","TWO_PLUS","OHI",45428],["2018-19","TWO_PLUS","OI",1102],["2018-19","TWO_PLUS","SLD",84226],["2018-19","TWO_PLUS","SLI",42006],["2018-19","TWO_PLUS","TBI",1010],["2018-19","TWO_PLUS","VI",847],["2018-19","WHITE","ALL",2951730],["2018-19","WHITE","AUT",331396],["2018-19","WHITE","DB",767],["2018-19","WHITE","DD",81630],["2018-19","WHITE","ED",172544],["2018-19","WHITE","HI",27661],["2018-19","WHITE","ID",171215],["2018-19","WHITE","MD",67266],["2018-19","WHITE","OHI",551542],["2018-19","WHITE","OI",16100],["2018-19","WHITE","SLD",990137],["2018-19","WHITE","SLI",515238],["2018-19","WHITE","TBI",14157],["2018-19","WHITE","VI",12004],["2019-20","AIAN","ALL",78605],["2019-20","AIAN","AUT",5396],["2019-20","AIAN","DB",18],["2019-20","AIAN","DD",5518],["2019-20","AIAN","ED",4248],["2019-20","AIAN","HI",734],["2019-20","AIAN","ID",5075],["2019-20","AIAN","MD",1905],["2019-20","AIAN","OHI",10361],["2019-20","AIAN","OI",261],["2019-20","AIAN","SLD",32714],["2019-20","AIAN","SLI",11356],["2019-20","AIAN","TBI",315],["2019-20","AIAN","VI",326],["2019-20","ASIAN","ALL",164852],["2019-20","ASIAN","AUT",42713],["2019-20","ASIAN","DB",79],["2019-20","ASIAN","DD",4839],["2019-20","ASIAN","ED",3659],["2019-20","ASIAN","HI",3842],["2019-20","ASIAN","ID",10849],["2019-20","ASIAN","MD",4658],["2019-20","ASIAN","OHI",15628],["2019-20","ASIAN","OI",1679],["2019-20","ASIAN","SLD",35887],["2019-20","ASIAN","SLI",38361],["2019-20","ASIAN","TBI",686],["2019-20","ASIAN","VI",1170],["2019-20","BLACK","ALL",1158071],["2019-20","BLACK","AUT",108046],["2019-20","BLACK","DB",177],["2019-20","BLACK","DD",38222],["2019-20","BLACK","ED",79440],["2019-20","BLACK","HI",8464],["2019-20","BLACK","ID",109636],["2019-20","BLACK","MD",21570],["2019-20","BLACK","OHI",191772],["2019-20","BLACK","OI",3966],["2019-20","BLACK","SLD",441496],["2019-20","BLACK","SLI",141495],["2019-20","BLACK","TBI",3858],["2019-20","BLACK","VI",3616],["2019-20","HISP","ALL",1731201],["2019-20","HISP","AUT",174012],["2019-20","HISP","DB",371],["2019-20","HISP","DD",39600],["2019-20","HISP","ED",65304],["2019-20","HISP","HI",20760],["2019-20","HISP","ID",110443],["2019-20","HISP","MD",25804],["2019-20","HISP","OHI",213385],["2019-20","HISP","OI",9100],["2019-20","HISP","SLD",757682],["2019-20","HISP","SLI",296214],["2019-20","HISP","TBI",5271],["2019-20","HISP","VI",5723],["2019-20","NHPI","ALL",18973],["2019-20","NHPI","AUT",1883],["2019-20","NHPI","DB",8],["2019-20","NHPI","DD",794],["2019-20","NHPI","ED",747],["2019-20","NHPI","HI",337],["2019-20","NHPI","ID",1504],["2019-20","NHPI","MD",549],["2019-20","NHPI","OHI",2384],["2019-20","NHPI","OI",113],["2019-20","NHPI","SLD",7981],["2019-20","NHPI","SLI",2345],["2019-20","NHPI","TBI",62],["2019-20","NHPI","VI",83],["2019-20","TWO_PLUS","ALL",283667],["2019-20","TWO_PLUS","AUT",33562],["2019-20","TWO_PLUS","DB",64],["2019-20","TWO_PLUS","DD",11170],["2019-20","TWO_PLUS","ED",20780],["2019-20","TWO_PLUS","HI",2375],["2019-20","TWO_PLUS","ID",13984],["2019-20","TWO_PLUS","MD",4916],["2019-20","TWO_PLUS","OHI",51879],["2019-20","TWO_PLUS","OI",1145],["2019-20","TWO_PLUS","SLD",91076],["2019-20","TWO_PLUS","SLI",47434],["2019-20","TWO_PLUS","TBI",1037],["2019-20","TWO_PLUS","VI",936],["2019-20","WHITE","ALL",3017976],["2019-20","WHITE","AUT",345412],["2019-20","WHITE","DB",817],["2019-20","WHITE","DD",93902],["2019-20","WHITE","ED",169878],["2019-20","WHITE","HI",27140],["2019-20","WHITE","ID",162118],["2019-20","WHITE","MD",66541],["2019-20","WHITE","OHI",567715],["2019-20","WHITE","OI",14814],["2019-20","WHITE","SLD",965074],["2019-20","WHITE","SLI",535305],["2019-20","WHITE","TBI",13693],["2019-20","WHITE","VI",11968],["2020-21","AIAN","ALL",80181],["2020-21","AIAN","AUT",5738],["2020-21","AIAN","DB",18],["2020-21","AIAN","DD",6858],["2020-21","AIAN","ED",4193],["2020-21","AIAN","HI",726],["2020-21","AIAN","ID",4904],["2020-21","AIAN","MD",1845],["2020-21","AIAN","OHI",10537],["2020-21","AIAN","OI",248],["2020-21","AIAN","SLD",31527],["2020-21","AIAN","SLI",12665],["2020-21","AIAN","TBI",320],["2020-21","AIAN","VI",315],["2020-21","ASIAN","ALL",178053],["2020-21","ASIAN","AUT",49199],["2020-21","ASIAN","DB",89],["2020-21","ASIAN","DD",7527],["2020-21","ASIAN","ED",3526],["2020-21","ASIAN","HI",3987],["2020-21","ASIAN","ID",10931],["2020-21","ASIAN","MD",4765],["2020-21","ASIAN","OHI",16363],["2020-21","ASIAN","OI",1714],["2020-21","ASIAN","SLD",35817],["2020-21","ASIAN","SLI",43287],["2020-21","ASIAN","TBI",700],["2020-21","ASIAN","VI",1158],["2020-21","BLACK","ALL",1145489],["2020-21","BLACK","AUT",116300],["2020-21","BLACK","DB",183],["2020-21","BLACK","DD",46875],["2020-21","BLACK","ED",77123],["2020-21","BLACK","HI",8081],["2020-21","BLACK","ID",102797],["2020-21","BLACK","MD",20665],["2020-21","BLACK","OHI",191480],["2020-21","BLACK","OI",3614],["2020-21","BLACK","SLD",415132],["2020-21","BLACK","SLI",150851],["2020-21","BLACK","TBI",3726],["2020-21","BLACK","VI",3399],["2020-21","HISP","ALL",1812531],["2020-21","HISP","AUT",196725],["2020-21","HISP","DB",387],["2020-21","HISP","DD",55631],["2020-21","HISP","ED",66405],["2020-21","HISP","HI",21302],["2020-21","HISP","ID",112658],["2020-21","HISP","MD",25906],["2020-21","HISP","OHI",225691],["2020-21","HISP","OI",9042],["2020-21","HISP","SLD",756834],["2020-21","HISP","SLI",335213],["2020-21","HISP","TBI",5203],["2020-21","HISP","VI",5731],["2020-21","NHPI","ALL",19308],["2020-21","NHPI","AUT",2083],["2020-21","NHPI","DB",8],["2020-21","NHPI","DD",1070],["2020-21","NHPI","ED",711],["2020-21","NHPI","HI",326],["2020-21","NHPI","ID",1460],["2020-21","NHPI","MD",532],["2020-21","NHPI","OHI",2461],["2020-21","NHPI","OI",102],["2020-21","NHPI","SLD",7775],["2020-21","NHPI","SLI",2487],["2020-21","NHPI","TBI",69],["2020-21","NHPI","VI",84],["2020-21","TWO_PLUS","ALL",304274],["2020-21","TWO_PLUS","AUT",37361],["2020-21","TWO_PLUS","DB",71],["2020-21","TWO_PLUS","DD",15557],["2020-21","TWO_PLUS","ED",22076],["2020-21","TWO_PLUS","HI",2586],["2020-21","TWO_PLUS","ID",14399],["2020-21","TWO_PLUS","MD",5005],["2020-21","TWO_PLUS","OHI",55403],["2020-21","TWO_PLUS","OI",1204],["2020-21","TWO_PLUS","SLD",92923],["2020-21","TWO_PLUS","SLI",53227],["2020-21","TWO_PLUS","TBI",1025],["2020-21","TWO_PLUS","VI",1003],["2020-21","WHITE","ALL",3071064],["2020-21","WHITE","AUT",358514],["2020-21","WHITE","DB",833],["2020-21","WHITE","DD",122572],["2020-21","WHITE","ED",169778],["2020-21","WHITE","HI",27695],["2020-21","WHITE","ID",156887],["2020-21","WHITE","MD",64021],["2020-21","WHITE","OHI",571251],["2020-21","WHITE","OI",14396],["2020-21","WHITE","SLD",936587],["2020-21","WHITE","SLI",581189],["2020-21","WHITE","TBI",13119],["2020-21","WHITE","VI",11960],["2021-22","AIAN","ALL",79921],["2021-22","AIAN","AUT",6080],["2021-22","AIAN","DB",22],["2021-22","AIAN","DD",6930],["2021-22","AIAN","ED",4065],["2021-22","AIAN","HI",719],["2021-22","AIAN","ID",4789],["2021-22","AIAN","MD",1807],["2021-22","AIAN","OHI",10591],["2021-22","AIAN","OI",242],["2021-22","AIAN","SLD",31305],["2021-22","AIAN","SLI",12362],["2021-22","AIAN","TBI",299],["2021-22","AIAN","VI",317],["2021-22","ASIAN","ALL",183801],["2021-22","ASIAN","AUT",53647],["2021-22","ASIAN","DB",85],["2021-22","ASIAN","DD",7561],["2021-22","ASIAN","ED",3418],["2021-22","ASIAN","HI",3964],["2021-22","ASIAN","ID",10789],["2021-22","ASIAN","MD",4705],["2021-22","ASIAN","OHI",16697],["2021-22","ASIAN","OI",1663],["2021-22","ASIAN","SLD",35242],["2021-22","ASIAN","SLI",43716],["2021-22","ASIAN","TBI",679],["2021-22","ASIAN","VI",1153],["2021-22","BLACK","ALL",1170099],["2021-22","BLACK","AUT",127131],["2021-22","BLACK","DB",198],["2021-22","BLACK","DD",49914],["2021-22","BLACK","ED",70640],["2021-22","BLACK","HI",8192],["2021-22","BLACK","ID",106031],["2021-22","BLACK","MD",20298],["2021-22","BLACK","OHI",194346],["2021-22","BLACK","OI",3711],["2021-22","BLACK","SLD",420525],["2021-22","BLACK","SLI",155852],["2021-22","BLACK","TBI",3746],["2021-22","BLACK","VI",3504],["2021-22","HISP","ALL",1881340],["2021-22","HISP","AUT",218569],["2021-22","HISP","DB",405],["2021-22","HISP","DD",58000],["2021-22","HISP","ED",63691],["2021-22","HISP","HI",21566],["2021-22","HISP","ID",115315],["2021-22","HISP","MD",25587],["2021-22","HISP","OHI",235002],["2021-22","HISP","OI",8730],["2021-22","HISP","SLD",764751],["2021-22","HISP","SLI",353976],["2021-22","HISP","TBI",5238],["2021-22","HISP","VI",5659],["2021-22","NHPI","ALL",19516],["2021-22","NHPI","AUT",2336],["2021-22","NHPI","DB",6],["2021-22","NHPI","DD",1062],["2021-22","NHPI","ED",639],["2021-22","NHPI","HI",325],["2021-22","NHPI","ID",1478],["2021-22","NHPI","MD",535],["2021-22","NHPI","OHI",2438],["2021-22","NHPI","OI",100],["2021-22","NHPI","SLD",7657],["2021-22","NHPI","SLI",2572],["2021-22","NHPI","TBI",66],["2021-22","NHPI","VI",78],["2021-22","TWO_PLUS","ALL",326271],["2021-22","TWO_PLUS","AUT",41830],["2021-22","TWO_PLUS","DB",84],["2021-22","TWO_PLUS","DD",16927],["2021-22","TWO_PLUS","ED",21498],["2021-22","TWO_PLUS","HI",2734],["2021-22","TWO_PLUS","ID",15233],["2021-22","TWO_PLUS","MD",5188],["2021-22","TWO_PLUS","OHI",59554],["2021-22","TWO_PLUS","OI",1212],["2021-22","TWO_PLUS","SLD",99023],["2021-22","TWO_PLUS","SLI",57211],["2021-22","TWO_PLUS","TBI",1065],["2021-22","TWO_PLUS","VI",1043],["2021-22","WHITE","ALL",3126370],["2021-22","WHITE","AUT",372733],["2021-22","WHITE","DB",835],["2021-22","WHITE","DD",126733],["2021-22","WHITE","ED",162117],["2021-22","WHITE","HI",27589],["2021-22","WHITE","ID",155712],["2021-22","WHITE","MD",63071],["2021-22","WHITE","OHI",586219],["2021-22","WHITE","OI",14011],["2021-22","WHITE","SLD",953362],["2021-22","WHITE","SLI",592850],["2021-22","WHITE","TBI",12931],["2021-22","WHITE","VI",12039],["2022-23","AIAN","ALL",80120],["2022-23","AIAN","AUT",6625],["2022-23","AIAN","DB",24],["2022-23","AIAN","DD",6841],["2022-23","AIAN","ED",3834],["2022-23","AIAN","HI",687],["2022-23","AIAN","ID",4783],["2022-23","AIAN","MD",1834],["2022-23","AIAN","OHI",10613],["2022-23","AIAN","OI",231],["2022-23","AIAN","SLD",31130],["2022-23","AIAN","SLI",12527],["2022-23","AIAN","TBI",291],["2022-23","AIAN","VI",313],["2022-23","ASIAN","ALL",190262],["2022-23","ASIAN","AUT",59020],["2022-23","ASIAN","DB",93],["2022-23","ASIAN","DD",7622],["2022-23","ASIAN","ED",3457],["2022-23","ASIAN","HI",3867],["2022-23","ASIAN","ID",10748],["2022-23","ASIAN","MD",4891],["2022-23","ASIAN","OHI",17241],["2022-23","ASIAN","OI",1555],["2022-23","ASIAN","SLD",34931],["2022-23","ASIAN","SLI",44181],["2022-23","ASIAN","TBI",694],["2022-23","ASIAN","VI",1122],["2022-23","BLACK","ALL",1157580],["2022-23","BLACK","AUT",138733],["2022-23","BLACK","DB",192],["2022-23","BLACK","DD",49087],["2022-23","BLACK","ED",65753],["2022-23","BLACK","HI",7724],["2022-23","BLACK","ID",105134],["2022-23","BLACK","MD",19829],["2022-23","BLACK","OHI",190636],["2022-23","BLACK","OI",3470],["2022-23","BLACK","SLD",408828],["2022-23","BLACK","SLI",154689],["2022-23","BLACK","TBI",3730],["2022-23","BLACK","VI",3273],["2022-23","HISP","ALL",1962715],["2022-23","HISP","AUT",248039],["2022-23","HISP","DB",429],["2022-23","HISP","DD",60577],["2022-23","HISP","ED",63594],["2022-23","HISP","HI",21287],["2022-23","HISP","ID",119595],["2022-23","HISP","MD",26374],["2022-23","HISP","OHI",246137],["2022-23","HISP","OI",8325],["2022-23","HISP","SLD",785286],["2022-23","HISP","SLI",364066],["2022-23","HISP","TBI",5405],["2022-23","HISP","VI",5565],["2022-23","NHPI","ALL",19816],["2022-23","NHPI","AUT",2554],["2022-23","NHPI","DB",8],["2022-23","NHPI","DD",1144],["2022-23","NHPI","ED",599],["2022-23","NHPI","HI",323],["2022-23","NHPI","ID",1483],["2022-23","NHPI","MD",538],["2022-23","NHPI","OHI",2406],["2022-23","NHPI","OI",96],["2022-23","NHPI","SLD",7602],["2022-23","NHPI","SLI",2635],["2022-23","NHPI","TBI",63],["2022-23","NHPI","VI",85],["2022-23","TWO_PLUS","ALL",354421],["2022-23","TWO_PLUS","AUT",49526],["2022-23","TWO_PLUS","DB",78],["2022-23","TWO_PLUS","DD",17770],["2022-23","TWO_PLUS","ED",22076],["2022-23","TWO_PLUS","HI",2819],["2022-23","TWO_PLUS","ID",16111],["2022-23","TWO_PLUS","MD",5592],["2022-23","TWO_PLUS","OHI",64707],["2022-23","TWO_PLUS","OI",1380],["2022-23","TWO_PLUS","SLD",106216],["2022-23","TWO_PLUS","SLI",61822],["2022-23","TWO_PLUS","TBI",1108],["2022-23","TWO_PLUS","VI",1112],["2022-23","WHITE","ALL",3128395],["2022-23","WHITE","AUT",383905],["2022-23","WHITE","DB",865],["2022-23","WHITE","DD",126479],["2022-23","WHITE","ED",157665],["2022-23","WHITE","HI",26452],["2022-23","WHITE","ID",152007],["2022-23","WHITE","MD",61512],["2022-23","WHITE","OHI",588150],["2022-23","WHITE","OI",13082],["2022-23","WHITE","SLD",948577],["2022-23","WHITE","SLI",598222],["2022-23","WHITE","TBI",12369],["2022-23","WHITE","VI",11526],["2023-24","AIAN","ALL",76563],["2023-24","AIAN","AUT",7063],["2023-24","AIAN","DB",23],["2023-24","AIAN","DD",6599],["2023-24","AIAN","ED",3633],["2023-24","AIAN","HI",597],["2023-24","AIAN","ID",4557],["2023-24","AIAN","MD",1823],["2023-24","AIAN","OHI",10480],["2023-24","AIAN","OI",214],["2023-24","AIAN","SLD",28521],["2023-24","AIAN","SLI",12178],["2023-24","AIAN","TBI",244],["2023-24","AIAN","VI",285],["2023-24","ASIAN","ALL",205716],["2023-24","ASIAN","AUT",67468],["2023-24","ASIAN","DB",100],["2023-24","ASIAN","DD",8586],["2023-24","ASIAN","ED",3515],["2023-24","ASIAN","HI",3930],["2023-24","ASIAN","ID",10950],["2023-24","ASIAN","MD",5102],["2023-24","ASIAN","OHI",18308],["2023-24","ASIAN","OI",1489],["2023-24","ASIAN","SLD",36339],["2023-24","ASIAN","SLI",47125],["2023-24","ASIAN","TBI",691],["2023-24","ASIAN","VI",1114],["2023-24","BLACK","ALL",1237890],["2023-24","BLACK","AUT",162938],["2023-24","BLACK","DB",200],["2023-24","BLACK","DD",57279],["2023-24","BLACK","ED",64281],["2023-24","BLACK","HI",7744],["2023-24","BLACK","ID",107881],["2023-24","BLACK","MD",20384],["2023-24","BLACK","OHI",201194],["2023-24","BLACK","OI",3370],["2023-24","BLACK","SLD",434405],["2023-24","BLACK","SLI",164237],["2023-24","BLACK","TBI",3768],["2023-24","BLACK","VI",3314],["2023-24","HISP","ALL",2059455],["2023-24","HISP","AUT",282655],["2023-24","HISP","DB",459],["2023-24","HISP","DD",66724],["2023-24","HISP","ED",64436],["2023-24","HISP","HI",21091],["2023-24","HISP","ID",122018],["2023-24","HISP","MD",27631],["2023-24","HISP","OHI",259960],["2023-24","HISP","OI",7684],["2023-24","HISP","SLD",808151],["2023-24","HISP","SLI",377783],["2023-24","HISP","TBI",5595],["2023-24","HISP","VI",5440],["2023-24","NHPI","ALL",20731],["2023-24","NHPI","AUT",2975],["2023-24","NHPI","DB",9],["2023-24","NHPI","DD",1273],["2023-24","NHPI","ED",571],["2023-24","NHPI","HI",333],["2023-24","NHPI","ID",1498],["2023-24","NHPI","MD",555],["2023-24","NHPI","OHI",2429],["2023-24","NHPI","OI",85],["2023-24","NHPI","SLD",7686],["2023-24","NHPI","SLI",2858],["2023-24","NHPI","TBI",62],["2023-24","NHPI","VI",79],["2023-24","TWO_PLUS","ALL",382131],["2023-24","TWO_PLUS","AUT",54919],["2023-24","TWO_PLUS","DB",83],["2023-24","TWO_PLUS","DD",20399],["2023-24","TWO_PLUS","ED",22682],["2023-24","TWO_PLUS","HI",2890],["2023-24","TWO_PLUS","ID",17027],["2023-24","TWO_PLUS","MD",5929],["2023-24","TWO_PLUS","OHI",70035],["2023-24","TWO_PLUS","OI",1269],["2023-24","TWO_PLUS","SLD",113148],["2023-24","TWO_PLUS","SLI",66869],["2023-24","TWO_PLUS","TBI",1137],["2023-24","TWO_PLUS","VI",1151],["2023-24","WHITE","ALL",3222518],["2023-24","WHITE","AUT",409136],["2023-24","WHITE","DB",909],["2023-24","WHITE","DD",135756],["2023-24","WHITE","ED",156258],["2023-24","WHITE","HI",26129],["2023-24","WHITE","ID",150171],["2023-24","WHITE","MD",61372],["2023-24","WHITE","OHI",607897],["2023-24","WHITE","OI",12656],["2023-24","WHITE","SLD",974607],["2023-24","WHITE","SLI",615738],["2023-24","WHITE","TBI",12090],["2023-24","WHITE","VI",11370],["2024-25","AIAN","ALL",83082],["2024-25","AIAN","AUT",7912],["2024-25","AIAN","DB",22],["2024-25","AIAN","DD",7599],["2024-25","AIAN","ED",3580],["2024-25","AIAN","HI",600],["2024-25","AIAN","ID",4555],["2024-25","AIAN","MD",3833],["2024-25","AIAN","OHI",10731],["2024-25","AIAN","OI",200],["2024-25","AIAN","SLD",30230],["2024-25","AIAN","SLI",12940],["2024-25","AIAN","TBI",252],["2024-25","AIAN","VI",283],["2024-25","ASIAN","ALL",218392],["2024-25","ASIAN","AUT",75507],["2024-25","ASIAN","DB",97],["2024-25","ASIAN","DD",9661],["2024-25","ASIAN","ED",3531],["2024-25","ASIAN","HI",3862],["2024-25","ASIAN","ID",10963],["2024-25","ASIAN","MD",5669],["2024-25","ASIAN","OHI",19306],["2024-25","ASIAN","OI",1407],["2024-25","ASIAN","SLD",37163],["2024-25","ASIAN","SLI",48457],["2024-25","ASIAN","TBI",687],["2024-25","ASIAN","VI",1079],["2024-25","BLACK","ALL",1284459],["2024-25","BLACK","AUT",188020],["2024-25","BLACK","DB",191],["2024-25","BLACK","DD",64762],["2024-25","BLACK","ED",62177],["2024-25","BLACK","HI",7647],["2024-25","BLACK","ID",107369],["2024-25","BLACK","MD",22708],["2024-25","BLACK","OHI",204814],["2024-25","BLACK","OI",3176],["2024-25","BLACK","SLD",442810],["2024-25","BLACK","SLI",166402],["2024-25","BLACK","TBI",3884],["2024-25","BLACK","VI",3296],["2024-25","HISP","ALL",2217196],["2024-25","HISP","AUT",326965],["2024-25","HISP","DB",405],["2024-25","HISP","DD",79439],["2024-25","HISP","ED",65057],["2024-25","HISP","HI",21134],["2024-25","HISP","ID",124060],["2024-25","HISP","MD",44403],["2024-25","HISP","OHI",276694],["2024-25","HISP","OI",7428],["2024-25","HISP","SLD",856241],["2024-25","HISP","SLI",393687],["2024-25","HISP","TBI",5871],["2024-25","HISP","VI",5523],["2024-25","NHPI","ALL",21651],["2024-25","NHPI","AUT",3479],["2024-25","NHPI","DB",6],["2024-25","NHPI","DD",1347],["2024-25","NHPI","ED",534],["2024-25","NHPI","HI",317],["2024-25","NHPI","ID",1534],["2024-25","NHPI","MD",650],["2024-25","NHPI","OHI",2493],["2024-25","NHPI","OI",83],["2024-25","NHPI","SLD",7772],["2024-25","NHPI","SLI",2912],["2024-25","NHPI","TBI",60],["2024-25","NHPI","VI",89],["2024-25","TWO_PLUS","ALL",412597],["2024-25","TWO_PLUS","AUT",63509],["2024-25","TWO_PLUS","DB",83],["2024-25","TWO_PLUS","DD",22996],["2024-25","TWO_PLUS","ED",23112],["2024-25","TWO_PLUS","HI",2934],["2024-25","TWO_PLUS","ID",17664],["2024-25","TWO_PLUS","MD",7766],["2024-25","TWO_PLUS","OHI",75636],["2024-25","TWO_PLUS","OI",1239],["2024-25","TWO_PLUS","SLD",120298],["2024-25","TWO_PLUS","SLI",70259],["2024-25","TWO_PLUS","TBI",1193],["2024-25","TWO_PLUS","VI",1196],["2024-25","WHITE","ALL",3253977],["2024-25","WHITE","AUT",433341],["2024-25","WHITE","DB",859],["2024-25","WHITE","DD",142293],["2024-25","WHITE","ED",150737],["2024-25","WHITE","HI",25417],["2024-25","WHITE","ID",145189],["2024-25","WHITE","MD",71636],["2024-25","WHITE","OHI",616346],["2024-25","WHITE","OI",11853],["2024-25","WHITE","SLD",980696],["2024-25","WHITE","SLI",605011],["2024-25","WHITE","TBI",11560],["2024-25","WHITE","VI",11062]],"sex_disability":[["2012-13","F","ALL",1891136],["2012-13","M","ALL",3802305],["2013-14","F","ALL",1900170],["2013-14","F","AUT",73681],["2013-14","F","DB",582],["2013-14","F","ED",86710],["2013-14","F","HI",31093],["2013-14","F","ID",167692],["2013-14","F","MD",47079],["2013-14","F","OHI",228734],["2013-14","F","OI",19499],["2013-14","F","SLD",830620],["2013-14","F","SLI",334488],["2013-14","F","TBI",9063],["2013-14","F","VI",10967],["2013-14","M","ALL",3808385],["2013-14","M","AUT",399598],["2013-14","M","DB",680],["2013-14","M","ED",256362],["2013-14","M","HI",35822],["2013-14","M","ID",232560],["2013-14","M","MD",76672],["2013-14","M","OHI",561870],["2013-14","M","OI",29703],["2013-14","M","SLD",1379873],["2013-14","M","SLI",675197],["2013-14","M","TBI",15974],["2013-14","M","VI",13846],["2014-15","F","ALL",1924124],["2014-15","F","AUT",79782],["2014-15","F","DB",557],["2014-15","F","DD",41998],["2014-15","F","ED",88543],["2014-15","F","HI",31186],["2014-15","F","ID",166937],["2014-15","F","MD",47147],["2014-15","F","OHI",242060],["2014-15","F","OI",18263],["2014-15","F","SLD",851681],["2014-15","F","SLI",335720],["2014-15","F","TBI",9142],["2014-15","F","VI",11108],["2014-15","M","ALL",3837863],["2014-15","M","AUT",429390],["2014-15","M","DB",661],["2014-15","M","DD",99296],["2014-15","M","ED",251789],["2014-15","M","HI",35489],["2014-15","M","ID",231670],["2014-15","M","MD",76719],["2014-15","M","OHI",597191],["2014-15","M","OI",26954],["2014-15","M","SLD",1381106],["2014-15","M","SLI",677825],["2014-15","M","TBI",16038],["2014-15","M","VI",13735],["2015-16","F","ALL",1967647],["2015-16","F","AUT",86398],["2015-16","F","DB",593],["2015-16","F","DD",44244],["2015-16","F","ED",90333],["2015-16","F","HI",30911],["2015-16","F","ID",168130],["2015-16","F","MD",47132],["2015-16","F","OHI",255754],["2015-16","F","OI",16640],["2015-16","F","SLD",871473],["2015-16","F","SLI",335946],["2015-16","F","TBI",9211],["2015-16","F","VI",10882],["2015-16","M","ALL",3905232],["2015-16","M","AUT",458800],["2015-16","M","DB",662],["2015-16","M","DD",104425],["2015-16","M","ED",248666],["2015-16","M","HI",35338],["2015-16","M","ID",233738],["2015-16","M","MD",76379],["2015-16","M","OHI",630638],["2015-16","M","OI",23589],["2015-16","M","SLD",1383804],["2015-16","M","SLI",679772],["2015-16","M","TBI",16053],["2015-16","M","VI",13368],["2016-17","F","ALL",1975709],["2016-17","F","AUT",92013],["2016-17","F","DB",587],["2016-17","F","DD",45555],["2016-17","F","ED",89269],["2016-17","F","HI",29921],["2016-17","F","ID",167354],["2016-17","F","MD",47620],["2016-17","F","OHI",262657],["2016-17","F","OI",14948],["2016-17","F","SLD",878534],["2016-17","F","SLI",327276],["2016-17","F","TBI",9214],["2016-17","F","VI",10761],["2016-17","M","ALL",3897805],["2016-17","M","AUT",480918],["2016-17","M","DB",674],["2016-17","M","DD",107835],["2016-17","M","ED",238482],["2016-17","M","HI",34389],["2016-17","M","ID",232183],["2016-17","M","MD",76605],["2016-17","M","OHI",647960],["2016-17","M","OI",20326],["2016-17","M","SLD",1367473],["2016-17","M","SLI",661908],["2016-17","M","TBI",15767],["2016-17","M","VI",13285],["2017-18","F","ALL",2016594],["2017-18","F","AUT",99144],["2017-18","F","DB",587],["2017-18","F","DD",47337],["2017-18","F","ED",90304],["2017-18","F","HI",29708],["2017-18","F","ID",168716],["2017-18","F","MD",46739],["2017-18","F","OHI",273760],["2017-18","F","OI",14403],["2017-18","F","SLD",895046],["2017-18","F","SLI",330835],["2017-18","F","TBI",9267],["2017-18","F","VI",10748],["2017-18","M","ALL",3948929],["2017-18","M","AUT",511189],["2017-18","M","DB",702],["2017-18","M","DD",111544],["2017-18","M","ED",237283],["2017-18","M","HI",34014],["2017-18","M","ID",233722],["2017-18","M","MD",74164],["2017-18","M","OHI",673576],["2017-18","M","OI",19496],["2017-18","M","SLD",1360425],["2017-18","M","SLI",663912],["2017-18","M","TBI",15828],["2017-18","M","VI",13074],["2018-19","F","ALL",2090154],["2018-19","F","AUT",108607],["2018-19","F","DB",667],["2018-19","F","DD",50003],["2018-19","F","ED",94200],["2018-19","F","HI",29483],["2018-19","F","ID",170345],["2018-19","F","MD",48134],["2018-19","F","OHI",290125],["2018-19","F","OI",13854],["2018-19","F","SLD",924973],["2018-19","F","SLI",339815],["2018-19","F","TBI",9289],["2018-19","F","VI",10659],["2018-19","M","ALL",4060097],["2018-19","M","AUT",548849],["2018-19","M","DB",739],["2018-19","M","DD",117001],["2018-19","M","ED",242709],["2018-19","M","HI",33788],["2018-19","M","ID",236868],["2018-19","M","MD",77049],["2018-19","M","OHI",711769],["2018-19","M","OI",18683],["2018-19","M","SLD",1368557],["2018-19","M","SLI",675301],["2018-19","M","TBI",15821],["2018-19","M","VI",12963],["2019-20","F","ALL",2205130],["2019-20","F","AUT",120253],["2019-20","F","DB",731],["2019-20","F","DD",57997],["2019-20","F","ED",97570],["2019-20","F","HI",29658],["2019-20","F","ID",172656],["2019-20","F","MD",48411],["2019-20","F","OHI",305614],["2019-20","F","OI",13188],["2019-20","F","SLD",955031],["2019-20","F","SLI",362218],["2019-20","F","TBI",9226],["2019-20","F","VI",10822],["2019-20","M","ALL",4247976],["2019-20","M","AUT",590773],["2019-20","M","DB",803],["2019-20","M","DD",136048],["2019-20","M","ED",246486],["2019-20","M","HI",33994],["2019-20","M","ID",240954],["2019-20","M","MD",77542],["2019-20","M","OHI",747515],["2019-20","M","OI",17891],["2019-20","M","SLD",1376893],["2019-20","M","SLI",710294],["2019-20","M","TBI",15696],["2019-20","M","VI",13000],["2020-21","F","ALL",2261391],["2020-21","F","AUT",132660],["2020-21","F","DB",763],["2020-21","F","DD",75599],["2020-21","F","ED",97774],["2020-21","F","HI",29997],["2020-21","F","ID",168250],["2020-21","F","MD",47139],["2020-21","F","OHI",312963],["2020-21","F","OI",12880],["2020-21","F","SLD",945947],["2020-21","F","SLI",394852],["2020-21","F","TBI",8984],["2020-21","F","VI",10777],["2020-21","M","ALL",4348985],["2020-21","M","AUT",628811],["2020-21","M","DB",825],["2020-21","M","DD",180421],["2020-21","M","ED",245973],["2020-21","M","HI",34421],["2020-21","M","ID",235141],["2020-21","M","MD",75456],["2020-21","M","OHI",759094],["2020-21","M","OI",17270],["2020-21","M","SLD",1330322],["2020-21","M","SLI",771057],["2020-21","M","TBI",15168],["2020-21","M","VI",12822],["2021-22","F","ALL",2339851],["2021-22","F","AUT",147501],["2021-22","F","DB",781],["2021-22","F","DD",79240],["2021-22","F","ED",95971],["2021-22","F","HI",30354],["2021-22","F","ID",169942],["2021-22","F","MD",46964],["2021-22","F","OHI",328520],["2021-22","F","OI",12692],["2021-22","F","SLD",972815],["2021-22","F","SLI",411919],["2021-22","F","TBI",8999],["2021-22","F","VI",10799],["2021-22","M","ALL",4446179],["2021-22","M","AUT",673441],["2021-22","M","DB",853],["2021-22","M","DD",187868],["2021-22","M","ED",230091],["2021-22","M","HI",34662],["2021-22","M","ID",239194],["2021-22","M","MD",74202],["2021-22","M","OHI",776090],["2021-22","M","OI",16914],["2021-22","M","SLD",1338976],["2021-22","M","SLI",803269],["2021-22","M","TBI",15022],["2021-22","M","VI",12969],["2022-23","F","ALL",2435467],["2022-23","F","AUT",167638],["2022-23","F","DB",809],["2022-23","F","DD",82101],["2022-23","F","ED",97695],["2022-23","F","HI",30024],["2022-23","F","ID",172447],["2022-23","F","MD",47384],["2022-23","F","OHI",342812],["2022-23","F","OI",12203],["2022-23","F","SLD",1009317],["2022-23","F","SLI",429325],["2022-23","F","TBI",9076],["2022-23","F","VI",10635],["2022-23","M","ALL",4560848],["2022-23","M","AUT",732360],["2022-23","M","DB",908],["2022-23","M","DD",194449],["2022-23","M","ED",221163],["2022-23","M","HI",34036],["2022-23","M","ID",243269],["2022-23","M","MD",74665],["2022-23","M","OHI",794454],["2022-23","M","OI",16263],["2022-23","M","SLD",1354909],["2022-23","M","SLI",823899],["2022-23","M","TBI",14767],["2022-23","M","VI",12742],["2023-24","F","ALL",2536028],["2023-24","F","AUT",191676],["2023-24","F","DB",831],["2023-24","F","DD",87708],["2023-24","F","ED",101019],["2023-24","F","HI",29514],["2023-24","F","ID",172238],["2023-24","F","MD",47764],["2023-24","F","OHI",358048],["2023-24","F","OI",11450],["2023-24","F","SLD",1045250],["2023-24","F","SLI",446581],["2023-24","F","TBI",9029],["2023-24","F","VI",10385],["2023-24","M","ALL",4665723],["2023-24","M","AUT",795572],["2023-24","M","DB",951],["2023-24","M","DD",208911],["2023-24","M","ED",214373],["2023-24","M","HI",33187],["2023-24","M","ID",241868],["2023-24","M","MD",75032],["2023-24","M","OHI",812302],["2023-24","M","OI",15312],["2023-24","M","SLD",1357716],["2023-24","M","SLI",840134],["2023-24","M","TBI",14558],["2023-24","M","VI",12367],["2024-25","F","ALL",2668777],["2024-25","F","AUT",224099],["2024-25","F","DB",815],["2024-25","F","DD",98397],["2024-25","F","ED",101410],["2024-25","F","HI",29225],["2024-25","F","ID",171550],["2024-25","F","MD",58872],["2024-25","F","OHI",373393],["2024-25","F","OI",10873],["2024-25","F","SLD",1098856],["2024-25","F","SLI",456957],["2024-25","F","TBI",9111],["2024-25","F","VI",10377],["2024-25","M","ALL",4818869],["2024-25","M","AUT",874644],["2024-25","M","DB",848],["2024-25","M","DD",229688],["2024-25","M","ED",207326],["2024-25","M","HI",32686],["2024-25","M","ID",239786],["2024-25","M","MD",97793],["2024-25","M","OHI",832632],["2024-25","M","OI",14513],["2024-25","M","SLD",1376368],["2024-25","M","SLI",842701],["2024-25","M","TBI",14396],["2024-25","M","VI",12151]],"lep_disability":[["2012-13","LEP_NO","ALL",5168899],["2012-13","LEP_YES","ALL",524540],["2013-14","LEP_NO","ALL",5134250],["2013-14","LEP_NO","AUT",444096],["2013-14","LEP_NO","DB",1189],["2013-14","LEP_NO","ED",334363],["2013-14","LEP_NO","HI",59163],["2013-14","LEP_NO","ID",363413],["2013-14","LEP_NO","MD",117946],["2013-14","LEP_NO","OHI",759085],["2013-14","LEP_NO","OI",43528],["2013-14","LEP_NO","SLD",1947029],["2013-14","LEP_NO","SLI",896149],["2013-14","LEP_NO","TBI",23620],["2013-14","LEP_NO","VI",22793],["2013-14","LEP_YES","ALL",541973],["2013-14","LEP_YES","AUT",31311],["2013-14","LEP_YES","DB",80],["2013-14","LEP_YES","ED",10841],["2013-14","LEP_YES","HI",7943],["2013-14","LEP_YES","ID",37586],["2013-14","LEP_YES","MD",6183],["2013-14","LEP_YES","OHI",36597],["2013-14","LEP_YES","OI",5730],["2013-14","LEP_YES","SLD",273407],["2013-14","LEP_YES","SLI",116869],["2013-14","LEP_YES","TBI",1487],["2013-14","LEP_YES","VI",2116],["2014-15","LEP_NO","ALL",5193304],["2014-15","LEP_NO","AUT",473512],["2014-15","LEP_NO","DB",1149],["2014-15","LEP_NO","DD",128013],["2014-15","LEP_NO","ED",329316],["2014-15","LEP_NO","HI",58595],["2014-15","LEP_NO","ID",358528],["2014-15","LEP_NO","MD",116985],["2014-15","LEP_NO","OHI",798297],["2014-15","LEP_NO","OI",39594],["2014-15","LEP_NO","SLD",1949910],["2014-15","LEP_NO","SLI",893165],["2014-15","LEP_NO","TBI",23635],["2014-15","LEP_NO","VI",22605],["2014-15","LEP_YES","ALL",568683],["2014-15","LEP_YES","AUT",35660],["2014-15","LEP_YES","DB",69],["2014-15","LEP_YES","DD",13281],["2014-15","LEP_YES","ED",11016],["2014-15","LEP_YES","HI",8080],["2014-15","LEP_YES","ID",40079],["2014-15","LEP_YES","MD",6881],["2014-15","LEP_YES","OHI",40954],["2014-15","LEP_YES","OI",5623],["2014-15","LEP_YES","SLD",282877],["2014-15","LEP_YES","SLI",120380],["2014-15","LEP_YES","TBI",1545],["2014-15","LEP_YES","VI",2238],["2015-16","LEP_NO","ALL",5323208],["2015-16","LEP_NO","AUT",504233],["2015-16","LEP_NO","DB",1178],["2015-16","LEP_NO","DD",133610],["2015-16","LEP_NO","ED",327306],["2015-16","LEP_NO","HI",57746],["2015-16","LEP_NO","ID",358395],["2015-16","LEP_NO","MD",116306],["2015-16","LEP_NO","OHI",839843],["2015-16","LEP_NO","OI",34982],["2015-16","LEP_NO","SLD",1956795],["2015-16","LEP_NO","SLI",893056],["2015-16","LEP_NO","TBI",23557],["2015-16","LEP_NO","VI",22078],["2015-16","LEP_YES","ALL",607267],["2015-16","LEP_YES","AUT",40965],["2015-16","LEP_YES","DB",77],["2015-16","LEP_YES","DD",15059],["2015-16","LEP_YES","ED",11693],["2015-16","LEP_YES","HI",8503],["2015-16","LEP_YES","ID",43473],["2015-16","LEP_YES","MD",7205],["2015-16","LEP_YES","OHI",46549],["2015-16","LEP_YES","OI",5247],["2015-16","LEP_YES","SLD",298482],["2015-16","LEP_YES","SLI",122662],["2015-16","LEP_YES","TBI",1707],["2015-16","LEP_YES","VI",2172],["2016-17","LEP_NO","ALL",5301963],["2016-17","LEP_NO","AUT",527296],["2016-17","LEP_NO","DB",1185],["2016-17","LEP_NO","DD",136599],["2016-17","LEP_NO","ED",315768],["2016-17","LEP_NO","HI",55702],["2016-17","LEP_NO","ID",354432],["2016-17","LEP_NO","MD",116395],["2016-17","LEP_NO","OHI",860041],["2016-17","LEP_NO","OI",30451],["2016-17","LEP_NO","SLD",1936889],["2016-17","LEP_NO","SLI",867836],["2016-17","LEP_NO","TBI",23165],["2016-17","LEP_NO","VI",21868],["2016-17","LEP_YES","ALL",629835],["2016-17","LEP_YES","AUT",45635],["2016-17","LEP_YES","DB",76],["2016-17","LEP_YES","DD",16791],["2016-17","LEP_YES","ED",11983],["2016-17","LEP_YES","HI",8608],["2016-17","LEP_YES","ID",45105],["2016-17","LEP_YES","MD",7830],["2016-17","LEP_YES","OHI",50576],["2016-17","LEP_YES","OI",4823],["2016-17","LEP_YES","SLD",309118],["2016-17","LEP_YES","SLI",121348],["2016-17","LEP_YES","TBI",1816],["2016-17","LEP_YES","VI",2178],["2017-18","LEP_NO","ALL",5274144],["2017-18","LEP_NO","AUT",552410],["2017-18","LEP_NO","DB",1196],["2017-18","LEP_NO","DD",130812],["2017-18","LEP_NO","ED",312910],["2017-18","LEP_NO","HI",53790],["2017-18","LEP_NO","ID",346871],["2017-18","LEP_NO","MD",111470],["2017-18","LEP_NO","OHI",879068],["2017-18","LEP_NO","OI",28217],["2017-18","LEP_NO","SLD",1901027],["2017-18","LEP_NO","SLI",857545],["2017-18","LEP_NO","TBI",22896],["2017-18","LEP_NO","VI",21115],["2017-18","LEP_YES","ALL",675750],["2017-18","LEP_YES","AUT",52765],["2017-18","LEP_YES","DB",88],["2017-18","LEP_YES","DD",20828],["2017-18","LEP_YES","ED",12904],["2017-18","LEP_YES","HI",8903],["2017-18","LEP_YES","ID",48084],["2017-18","LEP_YES","MD",8474],["2017-18","LEP_YES","OHI",57199],["2017-18","LEP_YES","OI",4777],["2017-18","LEP_YES","SLD",328667],["2017-18","LEP_YES","SLI",124726],["2017-18","LEP_YES","TBI",1985],["2017-18","LEP_YES","VI",2208],["2018-19","LEP_NO","ALL",5500765],["2018-19","LEP_NO","AUT",598615],["2018-19","LEP_NO","DB",1305],["2018-19","LEP_NO","DD",144977],["2018-19","LEP_NO","ED",322930],["2018-19","LEP_NO","HI",54244],["2018-19","LEP_NO","ID",357232],["2018-19","LEP_NO","MD",116075],["2018-19","LEP_NO","OHI",938475],["2018-19","LEP_NO","OI",28031],["2018-19","LEP_NO","SLD",1952539],["2018-19","LEP_NO","SLI",886050],["2018-19","LEP_NO","TBI",22972],["2018-19","LEP_NO","VI",21366],["2018-19","LEP_YES","ALL",710047],["2018-19","LEP_YES","AUT",58841],["2018-19","LEP_YES","DB",101],["2018-19","LEP_YES","DD",22027],["2018-19","LEP_YES","ED",13979],["2018-19","LEP_YES","HI",9027],["2018-19","LEP_YES","ID",49981],["2018-19","LEP_YES","MD",9108],["2018-19","LEP_YES","OHI",63419],["2018-19","LEP_YES","OI",4506],["2018-19","LEP_YES","SLD",340991],["2018-19","LEP_YES","SLI",129066],["2018-19","LEP_YES","TBI",2138],["2018-19","LEP_YES","VI",2256],["2019-20","LEP_NO","ALL",5716177],["2019-20","LEP_NO","AUT",645091],["2019-20","LEP_NO","DB",1419],["2019-20","LEP_NO","DD",168541],["2019-20","LEP_NO","ED",329509],["2019-20","LEP_NO","HI",54793],["2019-20","LEP_NO","ID",361761],["2019-20","LEP_NO","MD",116453],["2019-20","LEP_NO","OHI",985228],["2019-20","LEP_NO","OI",26902],["2019-20","LEP_NO","SLD",1986032],["2019-20","LEP_NO","SLI",939386],["2019-20","LEP_NO","TBI",22614],["2019-20","LEP_NO","VI",21644],["2019-20","LEP_YES","ALL",736078],["2019-20","LEP_YES","AUT",65866],["2019-20","LEP_YES","DB",115],["2019-20","LEP_YES","DD",25504],["2019-20","LEP_YES","ED",14544],["2019-20","LEP_YES","HI",8845],["2019-20","LEP_YES","ID",51835],["2019-20","LEP_YES","MD",9495],["2019-20","LEP_YES","OHI",67745],["2019-20","LEP_YES","OI",4176],["2019-20","LEP_YES","SLD",345590],["2019-20","LEP_YES","SLI",132843],["2019-20","LEP_YES","TBI",2307],["2019-20","LEP_YES","VI",2175],["2020-21","LEP_NO","ALL",5822647],["2020-21","LEP_NO","AUT",684431],["2020-21","LEP_NO","DB",1461],["2020-21","LEP_NO","DD",220849],["2020-21","LEP_NO","ED",328670],["2020-21","LEP_NO","HI",54999],["2020-21","LEP_NO","ID",350055],["2020-21","LEP_NO","MD",112801],["2020-21","LEP_NO","OHI",999089],["2020-21","LEP_NO","OI",26035],["2020-21","LEP_NO","SLD",1925269],["2020-21","LEP_NO","SLI",1016099],["2020-21","LEP_NO","TBI",21813],["2020-21","LEP_NO","VI",21324],["2020-21","LEP_YES","ALL",786574],["2020-21","LEP_YES","AUT",76927],["2020-21","LEP_YES","DB",127],["2020-21","LEP_YES","DD",35171],["2020-21","LEP_YES","ED",15074],["2020-21","LEP_YES","HI",9384],["2020-21","LEP_YES","ID",53328],["2020-21","LEP_YES","MD",9793],["2020-21","LEP_YES","OHI",72780],["2020-21","LEP_YES","OI",4104],["2020-21","LEP_YES","SLD",350551],["2020-21","LEP_YES","SLI",149467],["2020-21","LEP_YES","TBI",2339],["2020-21","LEP_YES","VI",2271],["2021-22","LEP_NO","ALL",5976564],["2021-22","LEP_NO","AUT",733542],["2021-22","LEP_NO","DB",1502],["2021-22","LEP_NO","DD",232147],["2021-22","LEP_NO","ED",311706],["2021-22","LEP_NO","HI",55512],["2021-22","LEP_NO","ID",354757],["2021-22","LEP_NO","MD",111595],["2021-22","LEP_NO","OHI",1029423],["2021-22","LEP_NO","OI",25730],["2021-22","LEP_NO","SLD",1961335],["2021-22","LEP_NO","SLI",1055687],["2021-22","LEP_NO","TBI",21649],["2021-22","LEP_NO","VI",21569],["2021-22","LEP_YES","ALL",808346],["2021-22","LEP_YES","AUT",87294],["2021-22","LEP_YES","DB",132],["2021-22","LEP_YES","DD",34961],["2021-22","LEP_YES","ED",14355],["2021-22","LEP_YES","HI",9484],["2021-22","LEP_YES","ID",54371],["2021-22","LEP_YES","MD",9569],["2021-22","LEP_YES","OHI",75017],["2021-22","LEP_YES","OI",3864],["2021-22","LEP_YES","SLD",350007],["2021-22","LEP_YES","SLI",159144],["2021-22","LEP_YES","TBI",2372],["2021-22","LEP_YES","VI",2204],["2022-23","LEP_NO","ALL",6151776],["2022-23","LEP_NO","AUT",798049],["2022-23","LEP_NO","DB",1565],["2022-23","LEP_NO","DD",239099],["2022-23","LEP_NO","ED",304276],["2022-23","LEP_NO","HI",54448],["2022-23","LEP_NO","ID",358745],["2022-23","LEP_NO","MD",111865],["2022-23","LEP_NO","OHI",1058660],["2022-23","LEP_NO","OI",24799],["2022-23","LEP_NO","SLD",2005312],["2022-23","LEP_NO","SLI",1091398],["2022-23","LEP_NO","TBI",21339],["2022-23","LEP_NO","VI",21153],["2022-23","LEP_YES","ALL",843295],["2022-23","LEP_YES","AUT",101808],["2022-23","LEP_YES","DB",152],["2022-23","LEP_YES","DD",37451],["2022-23","LEP_YES","ED",14578],["2022-23","LEP_YES","HI",9582],["2022-23","LEP_YES","ID",56967],["2022-23","LEP_YES","MD",10181],["2022-23","LEP_YES","OHI",78408],["2022-23","LEP_YES","OI",3654],["2022-23","LEP_YES","SLD",358447],["2022-23","LEP_YES","SLI",161444],["2022-23","LEP_YES","TBI",2504],["2022-23","LEP_YES","VI",2222],["2023-24","LEP_NO","ALL",6329726],["2023-24","LEP_NO","AUT",869781],["2023-24","LEP_NO","DB",1624],["2023-24","LEP_NO","DD",255158],["2023-24","LEP_NO","ED",300502],["2023-24","LEP_NO","HI",53312],["2023-24","LEP_NO","ID",356385],["2023-24","LEP_NO","MD",111913],["2023-24","LEP_NO","OHI",1089255],["2023-24","LEP_NO","OI",23419],["2023-24","LEP_NO","SLD",2043638],["2023-24","LEP_NO","SLI",1121692],["2023-24","LEP_NO","TBI",20947],["2023-24","LEP_NO","VI",20554],["2023-24","LEP_YES","ALL",872025],["2023-24","LEP_YES","AUT",117467],["2023-24","LEP_YES","DB",158],["2023-24","LEP_YES","DD",41461],["2023-24","LEP_YES","ED",14890],["2023-24","LEP_YES","HI",9389],["2023-24","LEP_YES","ID",57721],["2023-24","LEP_YES","MD",10883],["2023-24","LEP_YES","OHI",81095],["2023-24","LEP_YES","OI",3343],["2023-24","LEP_YES","SLD",359328],["2023-24","LEP_YES","SLI",165023],["2023-24","LEP_YES","TBI",2640],["2023-24","LEP_YES","VI",2198],["2024-25","LEP_NO","ALL",6564405],["2024-25","LEP_NO","AUT",962483],["2024-25","LEP_NO","DB",1512],["2024-25","LEP_NO","DD",280945],["2024-25","LEP_NO","ED",293490],["2024-25","LEP_NO","HI",52507],["2024-25","LEP_NO","ID",353078],["2024-25","LEP_NO","MD",140432],["2024-25","LEP_NO","OHI",1120854],["2024-25","LEP_NO","OI",22240],["2024-25","LEP_NO","SLD",2104607],["2024-25","LEP_NO","SLI",1129852],["2024-25","LEP_NO","TBI",20623],["2024-25","LEP_NO","VI",20291],["2024-25","LEP_YES","ALL",923241],["2024-25","LEP_YES","AUT",136260],["2024-25","LEP_YES","DB",151],["2024-25","LEP_YES","DD",47140],["2024-25","LEP_YES","ED",15246],["2024-25","LEP_YES","HI",9404],["2024-25","LEP_YES","ID",58258],["2024-25","LEP_YES","MD",16233],["2024-25","LEP_YES","OHI",85171],["2024-25","LEP_YES","OI",3146],["2024-25","LEP_YES","SLD",370617],["2024-25","LEP_YES","SLI",169806],["2024-25","LEP_YES","TBI",2884],["2024-25","LEP_YES","VI",2237]],"env_6_21":[["2012-13","CORRECTIONAL",16105],["2012-13","HOMEBOUND",22465],["2012-13","INSIDE_40_79",1122345],["2012-13","INSIDE_80_PLUS",3482240],["2012-13","INSIDE_LT_40",793809],["2012-13","PARENTAL_PRIVATE",68311],["2012-13","RESIDENTIAL",19065],["2012-13","SEPARATE_SCHOOL",169101],["2013-14","CORRECTIONAL",14979],["2013-14","HOMEBOUND",22794],["2013-14","INSIDE_40_79",1113413],["2013-14","INSIDE_80_PLUS",3542410],["2013-14","INSIDE_LT_40",793848],["2013-14","PARENTAL_PRIVATE",61668],["2013-14","RESIDENTIAL",17880],["2013-14","SEPARATE_SCHOOL",167401],["2014-15","CORRECTIONAL",13869],["2014-15","HOMEBOUND",22900],["2014-15","INSIDE_40_79",1100617],["2014-15","INSIDE_80_PLUS",3621930],["2014-15","INSIDE_LT_40",795081],["2014-15","PARENTAL_PRIVATE",77527],["2014-15","RESIDENTIAL",17125],["2014-15","SEPARATE_SCHOOL",170482],["2015-16","CORRECTIONAL",11994],["2015-16","HOMEBOUND",23036],["2015-16","INSIDE_40_79",1109789],["2015-16","INSIDE_80_PLUS",3708065],["2015-16","INSIDE_LT_40",807865],["2015-16","PARENTAL_PRIVATE",83986],["2015-16","RESIDENTIAL",16438],["2015-16","SEPARATE_SCHOOL",169302],["2016-17","CORRECTIONAL",11243],["2016-17","HOMEBOUND",22461],["2016-17","INSIDE_40_79",1098416],["2016-17","INSIDE_80_PLUS",3730462],["2016-17","INSIDE_LT_40",801673],["2016-17","PARENTAL_PRIVATE",80190],["2016-17","RESIDENTIAL",15390],["2016-17","SEPARATE_SCHOOL",171972],["2017-18","CORRECTIONAL",10747],["2017-18","HOMEBOUND",22774],["2017-18","INSIDE_40_79",1097606],["2017-18","INSIDE_80_PLUS",3817306],["2017-18","INSIDE_LT_40",805798],["2017-18","PARENTAL_PRIVATE",86601],["2017-18","RESIDENTIAL",14028],["2017-18","SEPARATE_SCHOOL",169653],["2018-19","CORRECTIONAL",10323],["2018-19","HOMEBOUND",23309],["2018-19","INSIDE_40_79",1115066],["2018-19","INSIDE_80_PLUS",3970941],["2018-19","INSIDE_LT_40",818667],["2018-19","PARENTAL_PRIVATE",87086],["2018-19","RESIDENTIAL",14001],["2018-19","SEPARATE_SCHOOL",171505],["2019-20","CORRECTIONAL",9491],["2019-20","HOMEBOUND",23379],["2019-20","INSIDE_40_79",1126799],["2019-20","INSIDE_80_PLUS",4178594],["2019-20","INSIDE_LT_40",832179],["2019-20","PARENTAL_PRIVATE",93803],["2019-20","RESIDENTIAL",13644],["2019-20","SEPARATE_SCHOOL",175491],["2020-21","CORRECTIONAL",7481],["2020-21","HOMEBOUND",20743],["2020-21","INSIDE_40_79",1094053],["2020-21","INSIDE_80_PLUS",4361002],["2020-21","INSIDE_LT_40",833210],["2020-21","PARENTAL_PRIVATE",104527],["2020-21","RESIDENTIAL",12536],["2020-21","SEPARATE_SCHOOL",176276],["2021-22","CORRECTIONAL",7333],["2021-22","HOMEBOUND",25690],["2021-22","INSIDE_40_79",1098353],["2021-22","INSIDE_80_PLUS",4516125],["2021-22","INSIDE_LT_40",852444],["2021-22","PARENTAL_PRIVATE",110768],["2021-22","RESIDENTIAL",11427],["2021-22","SEPARATE_SCHOOL",164663],["2022-23","CORRECTIONAL",7746],["2022-23","HOMEBOUND",23794],["2022-23","INSIDE_40_79",1107904],["2022-23","INSIDE_80_PLUS",4689177],["2022-23","INSIDE_LT_40",877921],["2022-23","PARENTAL_PRIVATE",114653],["2022-23","RESIDENTIAL",10589],["2022-23","SEPARATE_SCHOOL",166994],["2023-24","CORRECTIONAL",7996],["2023-24","HOMEBOUND",24431],["2023-24","INSIDE_40_79",1097479],["2023-24","INSIDE_80_PLUS",4879616],["2023-24","INSIDE_LT_40",893492],["2023-24","PARENTAL_PRIVATE",122575],["2023-24","RESIDENTIAL",10609],["2023-24","SEPARATE_SCHOOL",169176],["2024-25","CORRECTIONAL",8309],["2024-25","HOMEBOUND",24905],["2024-25","INSIDE_40_79",1117170],["2024-25","INSIDE_80_PLUS",5100285],["2024-25","INSIDE_LT_40",933362],["2024-25","PARENTAL_PRIVATE",122841],["2024-25","RESIDENTIAL",10773],["2024-25","SEPARATE_SCHOOL",173601]],"env_3_5":[["2012-13","EC_OTHER_GE10",130712],["2012-13","EC_OTHER_LT10",38552],["2012-13","EC_REG_GE10",266544],["2012-13","EC_REG_LT10",39312],["2012-13","HOME",15322],["2012-13","RESIDENTIAL",315],["2012-13","SEPARATE_CLASS",177157],["2012-13","SEPARATE_SCHOOL",20202],["2012-13","SERVICE_PROVIDER",47774],["2013-14","EC_OTHER_GE10",130444],["2013-14","EC_OTHER_LT10",36119],["2013-14","EC_REG_GE10",269976],["2013-14","EC_REG_LT10",39881],["2013-14","HOME",15363],["2013-14","RESIDENTIAL",260],["2013-14","SEPARATE_CLASS",173280],["2013-14","SEPARATE_SCHOOL",19696],["2013-14","SERVICE_PROVIDER",44684],["2014-15","EC_OTHER_GE10",129199],["2014-15","EC_OTHER_LT10",37236],["2014-15","EC_REG_GE10",274902],["2014-15","EC_REG_LT10",41034],["2014-15","HOME",15208],["2014-15","RESIDENTIAL",278],["2014-15","SEPARATE_CLASS",173320],["2014-15","SEPARATE_SCHOOL",19817],["2014-15","SERVICE_PROVIDER",44766],["2015-16","EC_OTHER_GE10",128743],["2015-16","EC_OTHER_LT10",37439],["2015-16","EC_REG_GE10",287810],["2015-16","EC_REG_LT10",40885],["2015-16","HOME",15412],["2015-16","RESIDENTIAL",191],["2015-16","SEPARATE_CLASS",172835],["2015-16","SEPARATE_SCHOOL",19175],["2015-16","SERVICE_PROVIDER",44009],["2016-17","EC_OTHER_GE10",129349],["2016-17","EC_OTHER_LT10",34139],["2016-17","EC_REG_GE10",291543],["2016-17","EC_REG_LT10",39914],["2016-17","HOME",13902],["2016-17","RESIDENTIAL",229],["2016-17","SEPARATE_CLASS",172788],["2016-17","SEPARATE_SCHOOL",18204],["2016-17","SERVICE_PROVIDER",44106],["2017-18","EC_OTHER_GE10",132140],["2017-18","EC_OTHER_LT10",33350],["2017-18","EC_REG_GE10",299263],["2017-18","EC_REG_LT10",37450],["2017-18","HOME",14080],["2017-18","RESIDENTIAL",185],["2017-18","SEPARATE_CLASS",176790],["2017-18","SEPARATE_SCHOOL",17604],["2017-18","SERVICE_PROVIDER",49502],["2018-19","EC_OTHER_GE10",140383],["2018-19","EC_OTHER_LT10",36184],["2018-19","EC_REG_GE10",317550],["2018-19","EC_REG_LT10",42333],["2018-19","HOME",15606],["2018-19","RESIDENTIAL",420],["2018-19","SEPARATE_CLASS",182362],["2018-19","SEPARATE_SCHOOL",17544],["2018-19","SERVICE_PROVIDER",50104],["2019-20","EC_OTHER_GE10",120442],["2019-20","EC_OTHER_LT10",29497],["2019-20","EC_REG_GE10",271268],["2019-20","EC_REG_LT10",35040],["2019-20","HOME",15458],["2019-20","RESIDENTIAL",138],["2019-20","SEPARATE_CLASS",171891],["2019-20","SEPARATE_SCHOOL",15169],["2019-20","SERVICE_PROVIDER",48734],["2020-21","EC_OTHER_GE10",64761],["2020-21","EC_OTHER_LT10",20431],["2020-21","EC_REG_GE10",169157],["2020-21","EC_REG_LT10",24631],["2020-21","HOME",20649],["2020-21","RESIDENTIAL",76],["2020-21","SEPARATE_CLASS",138948],["2020-21","SEPARATE_SCHOOL",11612],["2020-21","SERVICE_PROVIDER",44623],["2021-22","EC_OTHER_GE10",57950],["2021-22","EC_OTHER_LT10",16642],["2021-22","EC_REG_GE10",164416],["2021-22","EC_REG_LT10",23073],["2021-22","HOME",16585],["2021-22","RESIDENTIAL",77],["2021-22","SEPARATE_CLASS",134718],["2021-22","SEPARATE_SCHOOL",11243],["2021-22","SERVICE_PROVIDER",39536],["2022-23","EC_OTHER_GE10",68382],["2022-23","EC_OTHER_LT10",20407],["2022-23","EC_REG_GE10",189648],["2022-23","EC_REG_LT10",26495],["2022-23","HOME",15149],["2022-23","RESIDENTIAL",77],["2022-23","SEPARATE_CLASS",150087],["2022-23","SEPARATE_SCHOOL",12520],["2022-23","SERVICE_PROVIDER",44398],["2023-24","EC_OTHER_GE10",73539],["2023-24","EC_OTHER_LT10",22591],["2023-24","EC_REG_GE10",214494],["2023-24","EC_REG_LT10",29207],["2023-24","HOME",15305],["2023-24","RESIDENTIAL",119],["2023-24","SEPARATE_CLASS",162605],["2023-24","SEPARATE_SCHOOL",13406],["2023-24","SERVICE_PROVIDER",46824],["2024-25","EC_OTHER_GE10",75410],["2024-25","EC_OTHER_LT10",22067],["2024-25","EC_REG_GE10",226638],["2024-25","EC_REG_LT10",29016],["2024-25","HOME",14023],["2024-25","RESIDENTIAL",126],["2024-25","SEPARATE_CLASS",162583],["2024-25","SEPARATE_SCHOOL",13293],["2024-25","SERVICE_PROVIDER",47414]],"age_disability_2011":[[3,"AUT",10748],[3,"DB",30],[3,"DD",85677],[3,"ED",219],[3,"HI",2515],[3,"ID",2235],[3,"MD",1788],[3,"OHI",3568],[3,"OI",1873],[3,"SLD",1116],[3,"SLI",63386],[3,"TBI",123],[3,"VI",774],[4,"AUT",15931],[4,"DB",23],[4,"DD",114974],[4,"ED",511],[4,"HI",3064],[4,"ID",3000],[4,"MD",2132],[4,"OHI",5267],[4,"OI",2363],[4,"SLD",1913],[4,"SLI",109130],[4,"TBI",258],[4,"VI",1041],[5,"AUT",23586],[5,"DB",41],[5,"DD",76603],[5,"ED",2034],[5,"HI",3596],[5,"ID",6671],[5,"MD",3920],[5,"OHI",10969],[5,"OI",3022],[5,"SLD",5356],[5,"SLI",156570],[5,"TBI",338],[5,"VI",1243],[6,"AUT",31445],[6,"DB",36],[6,"DD",48915],[6,"ED",5913],[6,"HI",4220],[6,"ID",12143],[6,"MD",5624],[6,"OHI",20274],[6,"OI",3570],[6,"SLD",18842],[6,"SLI",193356],[6,"TBI",308],[6,"VI",1348],[7,"AUT",34851],[7,"DB",34],[7,"DD",36746],[7,"ED",10829],[7,"HI",4811],[7,"ID",16003],[7,"MD",6253],[7,"OHI",31231],[7,"OI",3829],[7,"SLD",50682],[7,"SLI",190494],[7,"TBI",550],[7,"VI",1516],[8,"AUT",38098],[8,"DB",52],[8,"DD",24261],[8,"ED",15780],[8,"HI",5049],[8,"ID",20683],[8,"MD",7270],[8,"OHI",43581],[8,"OI",4052],[8,"SLD",100571],[8,"SLI",169424],[8,"TBI",718],[8,"VI",1889],[9,"AUT",37741],[9,"DB",38],[9,"DD",5442],[9,"ED",20535],[9,"HI",5281],[9,"ID",26683],[9,"MD",8065],[9,"OHI",54732],[9,"OI",3874],[9,"SLD",154560],[9,"SLI",141064],[9,"TBI",887],[9,"VI",2082],[10,"AUT",37020],[10,"DB",56],[10,"ED",24552],[10,"HI",5678],[10,"ID",30290],[10,"MD",8961],[10,"OHI",62426],[10,"OI",4094],[10,"SLD",197188],[10,"SLI",111208],[10,"TBI",1492],[10,"VI",1902],[11,"AUT",35239],[11,"DB",48],[11,"ED",28772],[11,"HI",5829],[11,"ID",32996],[11,"MD",9407],[11,"OHI",67618],[11,"OI",4100],[11,"SLD",223328],[11,"SLI",76767],[11,"TBI",1495],[11,"VI",1819],[12,"AUT",32360],[12,"DB",15],[12,"ED",31762],[12,"HI",5701],[12,"ID",33824],[12,"MD",9492],[12,"OHI",69009],[12,"OI",3884],[12,"SLD",233157],[12,"SLI",50772],[12,"TBI",1287],[12,"VI",1615],[13,"AUT",30475],[13,"DB",18],[13,"ED",35468],[13,"HI",5615],[13,"ID",34550],[13,"MD",9793],[13,"OHI",70743],[13,"OI",3928],[13,"SLD",237753],[13,"SLI",35493],[13,"TBI",1182],[13,"VI",1331],[14,"AUT",27609],[14,"DB",21],[14,"ED",38249],[14,"HI",5454],[14,"ID",34394],[14,"MD",9598],[14,"OHI",69966],[14,"OI",4121],[14,"SLD",233585],[14,"SLI",24013],[14,"TBI",1550],[14,"VI",1428],[15,"AUT",25027],[15,"DB",65],[15,"ED",41235],[15,"HI",5250],[15,"ID",35485],[15,"MD",9602],[15,"OHI",69133],[15,"OI",3911],[15,"SLD",233996],[15,"SLI",17709],[15,"TBI",1972],[15,"VI",1696],[16,"AUT",23085],[16,"DB",59],[16,"ED",43753],[16,"HI",5273],[16,"ID",36501],[16,"MD",9496],[16,"OHI",66294],[16,"OI",4018],[16,"SLD",234580],[16,"SLI",14284],[16,"TBI",2292],[16,"VI",1483],[17,"AUT",20970],[17,"DB",55],[17,"ED",41890],[17,"HI",5184],[17,"ID",37781],[17,"MD",9664],[17,"OHI",59477],[17,"OI",3791],[17,"SLD",222979],[17,"SLI",11662],[17,"TBI",2339],[17,"VI",1286],[18,"AUT",13771],[18,"DB",20],[18,"ED",21120],[18,"HI",3111],[18,"ID",30798],[18,"MD",7713],[18,"OHI",28356],[18,"OI",2336],[18,"SLD",119052],[18,"SLI",5144],[18,"TBI",1367],[18,"VI",706],[19,"AUT",8334],[19,"DB",5],[19,"ED",6337],[19,"HI",1011],[19,"ID",18611],[19,"MD",5756],[19,"OHI",6337],[19,"OI",1155],[19,"SLD",24973],[19,"SLI",1029],[19,"TBI",435],[19,"VI",307],[20,"AUT",5428],[20,"DB",0],[20,"ED",2429],[20,"HI",327],[20,"ID",13482],[20,"MD",4578],[20,"OHI",1895],[20,"OI",728],[20,"SLD",6256],[20,"SLI",174],[20,"TBI",185],[20,"VI",134],[21,"AUT",2846],[21,"DB",5],[21,"ED",1104],[21,"HI",178],[21,"ID",7981],[21,"MD",2226],[21,"OHI",775],[21,"OI",545],[21,"SLD",2113],[21,"SLI",91],[21,"TBI",124],[21,"VI",88]],"age_all_ts":[["2005-06",3,153227],["2005-06",4,245685],["2005-06",5,299696],["2005-06",6,361063],["2005-06",7,411249],["2005-06",8,453573],["2005-06",9,488023],["2005-06",10,503665],["2005-06",11,508988],["2005-06",12,513957],["2005-06",13,519326],["2005-06",14,521013],["2005-06",15,519368],["2005-06",16,484143],["2005-06",17,417472],["2005-06",18,209585],["2005-06",19,60374],["2005-06",20,28637],["2005-06",21,13351],["2006-07",3,164085],["2006-07",4,244268],["2006-07",5,298048],["2006-07",6,365997],["2006-07",7,409178],["2006-07",8,459904],["2006-07",9,485296],["2006-07",10,495318],["2006-07",11,496267],["2006-07",12,505587],["2006-07",13,506375],["2006-07",14,509374],["2006-07",15,509387],["2006-07",16,492438],["2006-07",17,427788],["2006-07",18,213851],["2006-07",19,60700],["2006-07",20,28872],["2006-07",21,13511],["2007-08",3,159770],["2007-08",4,246951],["2007-08",5,291885],["2007-08",6,355901],["2007-08",7,410099],["2007-08",8,451303],["2007-08",9,485957],["2007-08",10,489572],["2007-08",11,485409],["2007-08",12,485755],["2007-08",13,492827],["2007-08",14,492276],["2007-08",15,494458],["2007-08",16,482728],["2007-08",17,440918],["2007-08",18,222978],["2007-08",19,63086],["2007-08",20,29808],["2007-08",21,14079],["2008-09",3,165860],["2008-09",4,245338],["2008-09",5,288768],["2008-09",6,344619],["2008-09",7,399835],["2008-09",8,448146],["2008-09",9,474714],["2008-09",10,490902],["2008-09",11,477441],["2008-09",12,472048],["2008-09",13,475260],["2008-09",14,477818],["2008-09",15,479693],["2008-09",16,470711],["2008-09",17,432790],["2008-09",18,228212],["2008-09",19,65435],["2008-09",20,31220],["2008-09",21,14452],["2009-10",3,172577],["2009-10",4,251978],["2009-10",5,291620],["2009-10",6,348620],["2009-10",7,392211],["2009-10",8,442291],["2009-10",9,479495],["2009-10",10,488886],["2009-10",11,485560],["2009-10",12,470465],["2009-10",13,465964],["2009-10",14,466209],["2009-10",15,471219],["2009-10",16,464804],["2009-10",17,431721],["2009-10",18,234385],["2009-10",19,72180],["2009-10",20,34122],["2009-10",21,15978],["2010-11",3,175865],["2010-11",4,257617],["2010-11",5,290256],["2010-11",6,348385],["2010-11",7,392233],["2010-11",8,431636],["2010-11",9,470721],["2010-11",10,492458],["2010-11",11,482106],["2010-11",12,475235],["2010-11",13,462031],["2010-11",14,454400],["2010-11",15,456747],["2010-11",16,454899],["2010-11",17,426352],["2010-11",18,236261],["2010-11",19,74119],["2010-11",20,36246],["2010-11",21,17009],["2011-12",3,174662],["2011-12",4,260163],["2011-12",5,295733],["2011-12",6,347125],["2011-12",7,388844],["2011-12",8,432135],["2011-12",9,461925],["2011-12",10,485549],["2011-12",11,488400],["2011-12",12,474723],["2011-12",13,468481],["2011-12",14,451374],["2011-12",15,445926],["2011-12",16,441963],["2011-12",17,418375],["2011-12",18,234371],["2011-12",19,75373],["2011-12",20,37409],["2011-12",21,18489],["2013-14",3,169565],["2013-14",4,255880],["2013-14",5,304258],["2013-14",6,365240],["2013-14",7,403599],["2013-14",8,441180],["2013-14",9,477156],["2013-14",10,494154],["2013-14",11,487491],["2013-14",12,482207],["2013-14",13,478701],["2013-14",14,460839],["2013-14",15,454352],["2013-14",16,433968],["2013-14",17,403147],["2013-14",18,222742],["2013-14",19,72259],["2013-14",20,38104],["2013-14",21,19254],["2014-15",3,173070],["2014-15",4,255467],["2014-15",5,307223],["2014-15",6,370072],["2014-15",7,415193],["2014-15",8,455259],["2014-15",9,485566],["2014-15",10,504490],["2014-15",11,499560],["2014-15",12,485251],["2014-15",13,479710],["2014-15",14,471774],["2014-15",15,456556],["2014-15",16,444660],["2014-15",17,405239],["2014-15",18,219560],["2014-15",19,69738],["2014-15",20,38018],["2014-15",21,18885],["2015-16",3,178073],["2015-16",4,262858],["2015-16",5,305568],["2015-16",6,374143],["2015-16",7,422078],["2015-16",8,470365],["2015-16",9,501908],["2015-16",10,514964],["2015-16",11,512242],["2015-16",12,499176],["2015-16",13,484359],["2015-16",14,474197],["2015-16",15,468750],["2015-16",16,448083],["2015-16",17,416494],["2015-16",18,219639],["2015-16",19,68490],["2015-16",20,36845],["2015-16",21,18742],["2016-17",3,176897],["2016-17",4,262264],["2016-17",5,305013],["2016-17",6,370800],["2016-17",7,420127],["2016-17",8,469962],["2016-17",9,510409],["2016-17",10,524656],["2016-17",11,515379],["2016-17",12,503452],["2016-17",13,489235],["2016-17",14,469095],["2016-17",15,461068],["2016-17",16,449926],["2016-17",17,409935],["2016-17",18,217233],["2016-17",19,66343],["2016-17",20,35686],["2016-17",21,18501],["2017-18",3,180572],["2017-18",4,263529],["2017-18",5,316263],["2017-18",6,384614],["2017-18",7,424999],["2017-18",8,474697],["2017-18",9,516666],["2017-18",10,539305],["2017-18",11,531345],["2017-18",12,512101],["2017-18",13,498673],["2017-18",14,478740],["2017-18",15,461604],["2017-18",16,447999],["2017-18",17,417127],["2017-18",18,215709],["2017-18",19,66604],["2017-18",20,36081],["2017-18",21,18249],["2018-19",3,189700],["2018-19",4,279084],["2018-19",5,333702],["2018-19",6,399336],["2018-19",7,447497],["2018-19",8,487977],["2018-19",9,528764],["2018-19",10,553619],["2018-19",11,554875],["2018-19",12,536617],["2018-19",13,514990],["2018-19",14,494745],["2018-19",15,477964],["2018-19",16,454496],["2018-19",17,421065],["2018-19",18,218147],["2018-19",19,65838],["2018-19",20,36413],["2018-19",21,18555],["2019-20",3,195561],["2019-20",4,283766],["2019-20",5,313925],["2019-20",6,401505],["2019-20",7,465644],["2019-20",8,512517],["2019-20",9,540496],["2019-20",10,563705],["2019-20",11,568951],["2019-20",12,559615],["2019-20",13,536283],["2019-20",14,508251],["2019-20",15,491220],["2019-20",16,467843],["2019-20",17,421399],["2019-20",18,210291],["2019-20",19,65091],["2019-20",20,36359],["2019-20",21,18595],["2020-21",3,149759],["2020-21",4,261172],["2020-21",5,328622],["2020-21",6,381241],["2020-21",7,446129],["2020-21",8,494301],["2020-21",9,533198],["2020-21",10,548097],["2020-21",11,558358],["2020-21",12,559328],["2020-21",13,551607],["2020-21",14,526474],["2020-21",15,503639],["2020-21",16,484312],["2020-21",17,442788],["2020-21",18,213468],["2020-21",19,66038],["2020-21",20,37433],["2020-21",21,18752],["2021-22",3,164488],["2021-22",4,240845],["2021-22",5,326449],["2021-22",6,402569],["2021-22",7,467220],["2021-22",8,509760],["2021-22",9,542304],["2021-22",10,560207],["2021-22",11,556864],["2021-22",12,560582],["2021-22",13,560978],["2021-22",14,547856],["2021-22",15,525390],["2021-22",16,495153],["2021-22",17,453276],["2021-22",18,214227],["2021-22",19,65290],["2021-22",20,37585],["2021-22",21,20000],["2022-23",3,195255],["2022-23",4,269820],["2022-23",5,345494],["2022-23",6,445375],["2022-23",7,500420],["2022-23",8,550318],["2022-23",9,570908],["2022-23",10,577857],["2022-23",11,569459],["2022-23",12,556379],["2022-23",13,557038],["2022-23",14,551881],["2022-23",15,542422],["2022-23",16,511966],["2022-23",17,456796],["2022-23",18,206726],["2022-23",19,61774],["2022-23",20,36080],["2022-23",21,19973],["2023-24",3,203718],["2023-24",4,308590],["2023-24",5,375987],["2023-24",6,467890],["2023-24",7,532596],["2023-24",8,580143],["2023-24",9,613449],["2023-24",10,606449],["2023-24",11,586509],["2023-24",12,564095],["2023-24",13,549769],["2023-24",14,543355],["2023-24",15,541622],["2023-24",16,523002],["2023-24",17,467683],["2023-24",18,203696],["2023-24",19,58866],["2023-24",20,36055],["2023-24",21,19974],["2024-25",3,203600],["2024-25",4,317351],["2024-25",5,417654],["2024-25",6,496502],["2024-25",7,553236],["2024-25",8,607485],["2024-25",9,640098],["2024-25",10,651702],["2024-25",11,619408],["2024-25",12,587160],["2024-25",13,563002],["2024-25",14,542118],["2024-25",15,540864],["2024-25",16,530604],["2024-25",17,484976],["2024-25",18,209281],["2024-25",19,59434],["2024-25",20,35491],["2024-25",21,21839]],"state_enroll_2022":[["Alabama",750923],["Alaska",130723],["Arizona",1132223],["Arkansas",493130],["Bureau of Indian Education",36692],["California",5930473],["Colorado",870871],["Connecticut",513513],["Delaware",141465],["District of Columbia",91001],["Florida",2870527],["Georgia",1750972],["Hawaii",170209],["Idaho",317555],["Illinois",1852242],["Indiana",1036108],["Iowa",511297],["Kansas",487978],["Kentucky",660029],["Louisiana",718145],["Maine",173853],["Maryland",889960],["Massachusetts",923349],["Michigan",1433914],["Minnesota",870019],["Mississippi",440285],["Missouri",892246],["Montana",150733],["Nebraska",329234],["Nevada",484192],["New Hampshire",168909],["New Jersey",1383830],["New Mexico",315023],["New York",2532888],["North Carolina",1541722],["North Dakota",118513],["Northern Marianas",9370],["Ohio",1680639],["Oklahoma",701301],["Oregon",577335],["Pennsylvania",1693347],["Puerto Rico",250668],["Rhode Island",137449],["South Carolina",789231],["South Dakota",141888],["Tennessee",1006752],["Texas",5519599],["U.S. Virgin Islands",10166],["Utah",691906],["Vermont",83654],["Virginia",1260351],["Washington",1090227],["West Virginia",251224],["Wisconsin",823040],["Wyoming",92467]],"dq_summary":[["RECLASSIFICATION_AGE5_PREBREAK","PRIMARY",22],["OSEP_TOTAL_VS_ENV_MISMATCH","INFERRED_FROM_ANOMALY",19],["IMPUTED_PK","PRIMARY",6],["COMPUTED_RATE","CROSSCHECK",5],["BACKFILL","PRIMARY",4],["IMPUTED","PRIMARY",4],["BACKFILL_AGE3_5","PRIMARY",3],["BACKFILL_AGE6_21","PRIMARY",2],["COVID","PRIMARY",2],["DEFINITION_CHANGE","PRIMARY",2],["MISSING","PRIMARY",2],["BACKFILL_AGE5_21","PRIMARY",1],["LOUISIANA_2020_21_PARTIAL_NCES_FOOTNOTE3","CROSSCHECK",1],["LOUISIANA_2021_22_PARTIAL_NCES_FOOTNOTE4","CROSSCHECK",1],["P2-3-OMB-NONE-2009","PRIMARY",1],["RECLASSIFICATION_AGE5","PRIMARY",1],["STATE_POLICY","PRIMARY",1],["TERMINOLOGY_CHANGE","PRIMARY",1],["WISCONSIN_2019_20_NCES_FOOTNOTE5","CROSSCHECK",1]],"dq_total":79,"dq_by_year":[["2007-08",1],["2008-09",1],["2009-10",1],["2010-11",2],["2012-13",3],["2013-14",14],["2015-16",1],["2016-17",3],["2017-18",4],["2018-19",26],["2019-20",6],["2020-21",6],["2021-22",6],["2022-23",3]],"coverage":{"fact_national":{"1976-77":9,"1980-81":11,"1990-91":12,"2000-01":14,"2008-09":14,"2009-10":14,"2010-11":14,"2011-12":14,"2012-13":14,"2013-14":14,"2014-15":14,"2015-16":14,"2016-17":14,"2017-18":14,"2018-19":14,"2019-20":14,"2020-21":14,"2021-22":14,"2022-23":14},"fact_state_total":{"1990-91":58,"2000-01":59,"2010-11":58,"2015-16":61,"2018-19":61,"2019-20":61,"2020-21":61,"2021-22":61,"2022-23":61},"fact_state_disability":{"2005-06":1480,"2006-07":1475,"2007-08":1453,"2008-09":1424,"2009-10":1456,"2010-11":1442,"2011-12":1406,"2012-13":1573,"2013-14":1486,"2014-15":1642,"2015-16":1671,"2016-17":1632,"2017-18":1603,"2018-19":1648,"2019-20":1628,"2020-21":1643,"2021-22":1632,"2022-23":1660,"2023-24":1628,"2024-25":1658},"fact_state_disability_environment":{"2012-13":13364,"2013-14":11429,"2014-15":13691,"2015-16":14087,"2016-17":13807,"2017-18":13568,"2018-19":13946,"2019-20":13717,"2020-21":13853,"2021-22":13730,"2022-23":13987,"2023-24":13717,"2024-25":13973},"fact_state_disability_race":{"2005-06":6344,"2006-07":6351,"2007-08":6042,"2008-09":6055,"2009-10":6608,"2010-11":8618,"2011-12":8466,"2012-13":10266,"2013-14":10238,"2014-15":11199,"2015-16":11285,"2016-17":10995,"2017-18":10866,"2018-19":11026,"2019-20":10884,"2020-21":11022,"2021-22":10819,"2022-23":10887,"2023-24":10943,"2024-25":11083},"fact_state_disability_sex":{"2012-13":240,"2013-14":1556,"2014-15":1665,"2015-16":1720,"2016-17":1690,"2017-18":1637,"2018-19":1695,"2019-20":1713,"2020-21":1746,"2021-22":1772,"2022-23":1776,"2023-24":1742,"2024-25":1776},"fact_state_disability_lep":{"2012-13":240,"2013-14":1528,"2014-15":1598,"2015-16":1723,"2016-17":1639,"2017-18":1611,"2018-19":1699,"2019-20":1647,"2020-21":1736,"2021-22":1698,"2022-23":1710,"2023-24":1738,"2024-25":1772},"fact_state_disability_age_single":{"2005-06":12653,"2006-07":12653,"2007-08":11778,"2008-09":11477,"2009-10":11840,"2010-11":11750,"2011-12":11580,"2013-14":1102,"2014-15":1127,"2015-16":1158,"2016-17":1137,"2017-18":1105,"2018-19":1138,"2019-20":1162,"2020-21":1201,"2021-22":1214,"2022-23":1204,"2023-24":1176,"2024-25":1194},"fact_state_enrollment":{"2012-13":55,"2013-14":55,"2014-15":54,"2015-16":54,"2016-17":55,"2017-18":56,"2018-19":56,"2019-20":56,"2020-21":56,"2021-22":56,"2022-23":55}},"row_counts":{"dim_disability":16,"dim_environment":15,"dim_jurisdiction":61,"dim_lep_status":2,"dim_race":8,"dim_sex":2,"dim_year":19,"fact_national":256,"fact_state_disability":31240,"fact_state_disability_age_single":97649,"fact_state_disability_environment":176869,"fact_state_disability_lep":20339,"fact_state_disability_race":189997,"fact_state_disability_sex":20728,"fact_state_enrollment":608,"fact_state_total":541,"meta_dataquality":79}};


// =====================================================================
// STYLE TOKENS — editorial / scientific monograph
// =====================================================================
const PAPER     = '#f4ede0';
const PAPER_2   = '#ebe2cf';
const PAPER_3   = '#e3d8be';
const INK       = '#1d1812';
const TEXT_2    = '#544839';
const TEXT_3    = '#8a7d6a';
const TEXT_4    = '#b8ad97';
const RULE      = '#cdbf9f';
const RULE_SOFT = '#dfd3b6';
const ACCENT    = '#8b3a2e';
const ACCENT_2  = '#2d4660';

const SERIF = "'Iowan Old Style','Charter','Source Serif Pro',Georgia,'Times New Roman',serif";
const MONO  = "'JetBrains Mono','SF Mono',Menlo,monospace";

// Calm chart palette — earth + ink
const PALETTE = ['#8b3a2e','#2d4660','#806d51','#5a6b4e','#a98a4a','#b56e4a','#4a6373','#6e7a52'];

// Per-disability color fixed across all charts so the eye learns the
// category once and recognises it everywhere.
const DISAB_COLOR = {
  SLD:'#8b3a2e', SLI:'#2d4660', OHI:'#806d51', AUT:'#5a6b4e', DD:'#a98a4a',
  ID:'#b56e4a',  ED:'#4a6373',  MD:'#6e7a52', HI:'#9c7752', VI:'#5e708c',
  OI:'#7a6b56',  TBI:'#675946', DB:'#3a4f5c', DEAF:'#544c3e', PRE:'#a39378', ALL:'#1d1812',
};

const RACE_COLOR = {
  WHITE:'#806d51', HISP:'#8b3a2e', BLACK:'#2d4660', ASIAN:'#5a6b4e',
  AIAN:'#b56e4a',  NHPI:'#a98a4a',  TWO_PLUS:'#4a6373', ASIAN_PI_OMB97:'#6e7a52',
};

const ENV_COLOR_6_21 = {
  INSIDE_80_PLUS:'#5a6b4e', INSIDE_40_79:'#a98a4a', INSIDE_LT_40:'#b56e4a',
  SEPARATE_SCHOOL:'#8b3a2e', RESIDENTIAL:'#4a6373', HOMEBOUND:'#6e7a52',
  CORRECTIONAL:'#544c3e', PARENTAL_PRIVATE:'#806d51',
};

const ENV_COLOR_3_5 = {
  EC_REG_GE10:'#5a6b4e', EC_REG_LT10:'#a98a4a', EC_OTHER_GE10:'#806d51',
  EC_OTHER_LT10:'#b56e4a', SEPARATE_CLASS:'#8b3a2e', HOME:'#4a6373', SERVICE_PROVIDER:'#6e7a52',
};



// =====================================================================
// HELPERS
// =====================================================================

const fmtN = (n) => {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e4) return (n/1e3).toFixed(0) + 'k';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
  return Math.round(n).toString();
};

const fmtNComma = (n) => {
  if (n == null || isNaN(n)) return '—';
  return Math.round(n).toLocaleString();
};

const fmtPct = (p, d=1) => p == null || isNaN(p) ? '—' : p.toFixed(d) + '%';
const fmtPctNum = (p, d=1) => p == null || isNaN(p) ? '—' : p.toFixed(d);

const yearShort = (y) => y ? y.split('-')[0] : '';
const yearTwo  = (y) => {
  if (!y) return '';
  const [a, b] = y.split('-');
  return `'${a.slice(2)}–'${b}`;
};

const ROMAN = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'];

// Disability ordering for visual stacks: by 2022-23 share, descending
const DISAB_ORDER = ['SLD','OHI','SLI','AUT','DD','ID','ED','MD','DB','HI','OI','TBI','VI'];

// Environment ordering (most-included → most-restrictive)
const ENV_ORDER_6_21 = [
  'INSIDE_80_PLUS','INSIDE_40_79','INSIDE_LT_40','SEPARATE_SCHOOL',
  'RESIDENTIAL','HOMEBOUND','CORRECTIONAL','PARENTAL_PRIVATE',
];
const ENV_ORDER_3_5 = [
  'EC_REG_GE10','EC_REG_LT10','EC_OTHER_GE10','EC_OTHER_LT10',
  'SEPARATE_CLASS','HOME','SERVICE_PROVIDER',
];

// Race ordering (largest → smallest at national level)
const RACE_ORDER = ['WHITE','HISP','BLACK','ASIAN','TWO_PLUS','AIAN','NHPI'];



// =====================================================================
// LAYOUT COMPONENTS
// =====================================================================

const SmallCaps = ({ children, style, ...rest }) => (
  <span
    style={{ fontFamily: SERIF, fontVariant: 'small-caps', letterSpacing: '0.18em', ...style }}
    {...rest}
  >
    {children}
  </span>
);

const Rule = ({ kind = 'soft' }) => (
  <hr style={{ border: 0, borderTop: `1px solid ${kind === 'soft' ? RULE_SOFT : RULE}`, margin: '0' }} />
);

function PlateNum({ n }) {
  return (
    <SmallCaps style={{ fontSize: 11, color: TEXT_3 }}>
      Plate&nbsp;{ROMAN[n] || n}
    </SmallCaps>
  );
}

function Caption({ n, title, children, source }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <PlateNum n={n} />
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: INK, fontSize: 14 }}>
          {title}
        </span>
      </div>
      {children && (
        <p style={{ fontFamily: SERIF, color: TEXT_2, fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>
          {children}
        </p>
      )}
      {source && (
        <p style={{ fontFamily: MONO, color: TEXT_3, fontSize: 10, marginTop: 6, letterSpacing: '0.04em' }}>
          {source}
        </p>
      )}
    </div>
  );
}

function Section({ id, num, title, kicker, lede, children }) {
  return (
    <section id={id} style={{ paddingTop: 56, paddingBottom: 24, scrollMarginTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <SmallCaps style={{ fontSize: 11, color: ACCENT }}>
          §&nbsp;{ROMAN[num] || num}&nbsp;&middot;&nbsp;{kicker}
        </SmallCaps>
        <h2 style={{
          fontFamily: SERIF, color: INK, fontSize: 'clamp(28px, 5.4vw, 44px)',
          fontWeight: 400, lineHeight: 1.05, marginTop: 8, marginBottom: 16,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        {lede && (
          <p style={{
            fontFamily: SERIF, color: TEXT_2, fontSize: 'clamp(15px,1.8vw,17px)',
            lineHeight: 1.65, maxWidth: 640, marginBottom: 0,
          }}>
            {lede}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function MarginNote({ children }) {
  return (
    <aside style={{
      borderLeft: `1px solid ${RULE}`,
      paddingLeft: 14,
      fontFamily: SERIF, fontStyle: 'italic',
      fontSize: 12.5, lineHeight: 1.55, color: TEXT_2,
      maxWidth: 360, marginTop: 18,
    }}>
      {children}
    </aside>
  );
}

function StatCard({ kicker, value, unit, sub }) {
  return (
    <div style={{
      borderTop: `1px solid ${RULE}`, paddingTop: 14, paddingBottom: 6,
    }}>
      <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>{kicker}</SmallCaps>
      <div style={{
        fontFamily: SERIF, fontSize: 'clamp(28px, 5vw, 40px)',
        color: INK, lineHeight: 1.05, marginTop: 6, fontWeight: 400, letterSpacing: '-0.01em',
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: '0.5em', color: TEXT_2, marginLeft: 4, fontStyle: 'italic' }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontFamily: SERIF, fontSize: 12, color: TEXT_2, marginTop: 6, fontStyle: 'italic' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Recharts shared axis style
const AXIS_STYLE = { fontFamily: MONO, fontSize: 10, fill: TEXT_3, letterSpacing: '0.04em' };

function ChartFrame({ children, height = 280 }) {
  return (
    <div style={{ width: '100%', height, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: PAPER, border: `1px solid ${RULE}`, padding: '8px 12px',
      fontFamily: SERIF, fontSize: 12, color: INK, boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 10, color: TEXT_3,
        letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase',
      }}>
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color || INK }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, background: p.color,
              marginRight: 6, borderRadius: 0,
            }} />
            {p.name}
          </span>
          <span style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums' }}>
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}


// =====================================================================
// MASTHEAD + INTRO
// =====================================================================

function Masthead() {
  return (
    <header style={{ borderBottom: `2px solid ${INK}`, paddingTop: 24, paddingBottom: 24 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        flexWrap: 'wrap', gap: 12, marginBottom: 18,
      }}>
        <SmallCaps style={{ fontSize: 11, color: TEXT_2 }}>
          A Statistical Companion
        </SmallCaps>
        <SmallCaps style={{ fontSize: 11, color: TEXT_3 }}>
          idea_db&nbsp;·&nbsp;Edition&nbsp;May&nbsp;2026
        </SmallCaps>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{
          fontFamily: SERIF, fontSize: 'clamp(32px, 6vw, 60px)',
          color: INK, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.015em',
          margin: 0,
        }}>
          Special-education identification<br/>in the United States
        </h1>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 'clamp(16px, 2.4vw, 22px)',
          color: TEXT_2, marginTop: 14, marginBottom: 0, lineHeight: 1.4,
          maxWidth: 700,
        }}>
          A statistical companion to IDEA Section&nbsp;618 reporting and the NCES Digest,
          with margin notes and provenance.
        </p>
      </div>
      <div style={{
        display: 'flex', gap: 24, fontFamily: MONO, fontSize: 10,
        color: TEXT_3, letterSpacing: '0.06em', flexWrap: 'wrap',
      }}>
        <span>{DATA.row_counts.fact_state_disability_environment.toLocaleString()} ENV·CELLS</span>
        <span>{DATA.row_counts.fact_state_disability_race.toLocaleString()} RACE·CELLS</span>
        <span>{DATA.row_counts.fact_state_disability.toLocaleString()} STATE·DISAB</span>
        <span>{DATA.row_counts.meta_dataquality} DQ·FLAGS</span>
      </div>
    </header>
  );
}

function Frontispiece() {
  // The "drop-cap" introduction. Also serves as the editorial framing.
  return (
    <div style={{ paddingTop: 40, paddingBottom: 24, position: 'relative' }}>
      <p style={{
        fontFamily: SERIF, fontSize: 'clamp(16px, 2vw, 18px)',
        lineHeight: 1.65, color: INK, maxWidth: 660, margin: 0,
      }}>
        <span style={{
          float: 'left', fontFamily: SERIF, fontSize: '4.5em', lineHeight: 0.85,
          marginRight: 10, marginTop: 4, color: ACCENT, fontWeight: 400,
        }}>S</span>
        ince the Education for All Handicapped Children Act took effect in fall&nbsp;1976, the share
        of U.S. public-school students receiving special-education services has nearly doubled,
        from <strong style={{ color: ACCENT }}>8.3&nbsp;percent</strong> to{' '}
        <strong style={{ color: ACCENT }}>15.2&nbsp;percent</strong>. The composition of that
        population has been refigured at least three times in the same span. This monograph is
        the panel as it currently stands: a national series running back to 1976; state-level
        breakdowns by disability and race from 2005&ndash;06; environment, sex, and English-learner
        cross-tabs from 2012&ndash;13; all running through 2024&ndash;25.
      </p>
      <p style={{
        fontFamily: SERIF, fontStyle: 'italic',
        fontSize: 13, lineHeight: 1.55, color: TEXT_2, maxWidth: 660,
        marginTop: 20, marginBottom: 0,
      }}>
        Every figure below is reproducible from raw OSEP Section&nbsp;618 child-count files and
        NCES Digest tables&nbsp;204.30, 204.70, and 203.20. Build determinism is enforced by a
        master content hash; data-quality flags travel inline. See &sect;&nbsp;XIV.
      </p>
    </div>
  );
}

// =====================================================================
// AT A GLANCE  (4-card grid)
// =====================================================================

function AtAGlance() {
  // Compute headline figures
  const allNat = DATA.national.filter(r => r[1] === 'ALL');
  const latest = allNat[allNat.length - 1];      // 2022-23
  const earliest = allNat[0];                    // 1976-77

  const totalLatest    = latest[2] * 1000;       // n_thousands → persons
  const pctLatest      = latest[4];
  const totalEarliest  = earliest[2] * 1000;
  const pctEarliest    = earliest[4];

  // Distinct years in the panel
  const years = new Set();
  Object.values(DATA.coverage).forEach(o => Object.keys(o).forEach(y => years.add(y)));

  // Total source rows
  const totalRows = Object.values(DATA.row_counts).reduce((a, b) => a + b, 0);

  return (
    <section style={{ paddingTop: 8, paddingBottom: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 'clamp(16px, 3vw, 32px)', marginTop: 16,
      }}>
        <StatCard
          kicker="Latest enrollment, 2022–23"
          value={fmtN(totalLatest)}
          sub={`${fmtPct(pctLatest)} of public-school students`}
        />
        <StatCard
          kicker="Half-century shift"
          value={`+${(pctLatest - pctEarliest).toFixed(1)}`}
          unit="pp"
          sub={`from ${fmtPct(pctEarliest)} (1976–77) to ${fmtPct(pctLatest)} (2022–23)`}
        />
        <StatCard
          kicker="Range across states"
          value={`11.7 — 21.1`}
          unit="%"
          sub={`Hawaii to Pennsylvania, 2022–23 — a ${(21.1/11.7).toFixed(1)}× spread`}
        />
        <StatCard
          kicker="Source rows in panel"
          value={fmtN(totalRows)}
          sub={`${years.size} distinct school years across nine fact tables`}
        />
      </div>
    </section>
  );
}

// =====================================================================
// TABLE OF CONTENTS  (sticky on the side at desktop, top-row at mobile)
// =====================================================================

const TOC = [
  { num: 1,  id: 'I-trajectory', title: 'The Half-Century Curve' },
  { num: 2,  id: 'II-composition', title: 'Composition Has Shifted' },
  { num: 3,  id: 'III-categories',  title: 'Category Trajectories' },
  { num: 4,  id: 'IV-geography',    title: 'A Geography of Identification' },
  { num: 5,  id: 'V-state-detail',  title: 'A State Read at the Disability Level' },
  { num: 6,  id: 'VI-trajectories', title: 'State Trajectories' },
  { num: 7,  id: 'VII-sex',         title: 'Sex Asymmetries' },
  { num: 8,  id: 'VIII-race',       title: 'Race & Ethnicity' },
  { num: 9,  id: 'IX-el',           title: 'English Learners' },
  { num: 10, id: 'X-environment',   title: 'Where Children Are Served' },
  { num: 11, id: 'XI-age',          title: 'The Age Profile' },
  { num: 12, id: 'XII-dq',          title: 'Data-Quality Inventory' },
  { num: 13, id: 'XIII-coverage',   title: 'Coverage Matrix' },
  { num: 14, id: 'XIV-colophon',    title: 'Colophon &amp; Sources' },
];

function TableOfContents() {
  return (
    <nav style={{
      borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`,
      padding: '20px 0', marginTop: 20, marginBottom: 12,
    }}>
      <SmallCaps style={{ fontSize: 11, color: TEXT_3, marginBottom: 12, display: 'block' }}>
        Contents
      </SmallCaps>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '6px 24px',
      }}>
        {TOC.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              style={{
                fontFamily: SERIF, fontSize: 14, color: INK, textDecoration: 'none',
                display: 'flex', gap: 10, alignItems: 'baseline',
                paddingTop: 4, paddingBottom: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = ACCENT}
              onMouseLeave={e => e.currentTarget.style.color = INK}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_3, minWidth: 28 }}>
                {String(item.num).padStart(2,'0')}
              </span>
              <span dangerouslySetInnerHTML={{ __html: item.title }} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}


// =====================================================================
// SECTION I — THE HALF-CENTURY CURVE
// =====================================================================

function SectionI() {
  // National 'ALL' time-series → pct_enrollment + n_thousands
  const series = DATA.national
    .filter(r => r[1] === 'ALL')
    .map(r => ({ year: r[0], yshort: yearShort(r[0]), n: r[2], pct: r[4] }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const peakPct = Math.max(...series.map(s => s.pct));
  const troughBetween = series.filter(s => s.year >= '2009-10' && s.year <= '2012-13')
    .sort((a, b) => a.pct - b.pct)[0];

  return (
    <Section
      id="I-trajectory" num={1}
      kicker="National rate"
      title="The Half-Century Curve"
      lede="The national identification rate has not been a smooth line. It rose sharply through the 1980s and 90s, plateaued near 13.3 percent at the turn of the millennium, drifted down to a 2009–10 trough, then resumed climbing — passing every previous high during the COVID years."
    >
      <ChartFrame height={360}>
        <ComposedChart data={series} margin={{ top: 18, right: 20, bottom: 12, left: -8 }}>
          <CartesianGrid stroke={RULE_SOFT} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="yshort"
            stroke={TEXT_3}
            tickLine={false} axisLine={{ stroke: RULE }}
            tick={AXIS_STYLE}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="L"
            stroke={TEXT_3} tickLine={false} axisLine={false}
            tick={AXIS_STYLE} domain={[6, 17]}
            label={{ value: '% of public-school enrollment', angle: -90, position: 'insideLeft',
                     style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 11, fill: TEXT_2 }, dy: 90, dx: 12 }}
          />
          <YAxis
            yAxisId="R" orientation="right"
            stroke={TEXT_3} tickLine={false} axisLine={false}
            tick={AXIS_STYLE} domain={[3000, 8000]}
            tickFormatter={v => (v/1000).toFixed(0) + 'M'}
          />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => series.find(s => s.yshort === l)?.year || l}
              formatter={(v, name) => name === 'pct_enrollment'
                ? v.toFixed(1) + '%'
                : (v * 1000).toLocaleString() + ' students' }
            />}
          />
          <Area
            yAxisId="R"
            dataKey="n" name="n_students"
            stroke="none"
            fill={INK} fillOpacity={0.05}
            isAnimationActive={false}
          />
          <Line
            yAxisId="L" type="linear"
            dataKey="pct" name="pct_enrollment"
            stroke={ACCENT} strokeWidth={2}
            dot={{ r: 2.5, fill: ACCENT, stroke: PAPER, strokeWidth: 1 }}
            activeDot={{ r: 4, fill: ACCENT }}
            isAnimationActive={false}
          />
          <ReferenceLine y={13.3} yAxisId="L" stroke={TEXT_3}
            strokeDasharray="2 4" label={{
              position: 'right', value: 'SY 2000–01: 13.3%',
              style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 11, fill: TEXT_2 }
            }} />
        </ComposedChart>
      </ChartFrame>
      <Caption
        n={1}
        title="National identification rate and total served, 1976–77 → 2022–23"
        source="Source — NCES Digest 2023, Table 204.30. fact_national, 256 rows. n is plotted as a faint area against the right axis (millions); the rate is plotted as the line against the left axis (%)."
      >
        Two break points are visible. After SY&nbsp;2000–01, the trajectory inverts &mdash; the
        rate falls for a decade as states tighten Specific&nbsp;Learning&nbsp;Disability criteria
        following IDEA 2004. Then, after SY&nbsp;2011–12, the rate climbs steadily, lifted
        almost entirely by Autism (AUT) and Other Health Impairment (OHI) &mdash; see
        &sect;&nbsp;II–III.
      </Caption>
      <MarginNote>
        The 2020–21 dip in the absolute count (n) but rise in the rate is a denominator
        artifact: COVID school closures depressed the public-school enrollment denominator more
        than the IDEA numerator. Flagged as <code style={{ fontFamily: MONO, fontSize: 11 }}>
        COVID</code> in <code style={{ fontFamily: MONO, fontSize: 11 }}>meta_dataquality</code>.
      </MarginNote>
    </Section>
  );
}

// =====================================================================
// SECTION II — COMPOSITION
// =====================================================================

function SectionII() {
  // Build wide rows for stacked area: every year that has all 13 categories
  // (post-2000 has DD; pre-1990 omits DD/AUT/TBI; we use 1976,1980,1990,2000-2023)
  // Use 'ALL years from fact_national', stack by disability codes.
  const yrs = [...new Set(DATA.national.map(r => r[0]))].sort();
  const rows = yrs.map(yr => {
    const rec = DATA.national.filter(r => r[0] === yr);
    const obj = { year: yr, yshort: yearShort(yr) };
    for (const r of rec) {
      if (r[1] !== 'ALL') obj[r[1]] = r[2]; // n_thousands
    }
    return obj;
  });

  return (
    <Section
      id="II-composition" num={2}
      kicker="National composition"
      title="Composition Has Shifted"
      lede="Five categories — Specific Learning Disability, Speech or Language Impairment, Other Health Impairment, Autism, and Developmental Delay — together account for 87 percent of all served students in 2022–23. Their relative shares have moved in opposite directions over the panel."
    >
      <ChartFrame height={400}>
        <AreaChart data={rows} margin={{ top: 12, right: 20, bottom: 12, left: -8 }}>
          <CartesianGrid stroke={RULE_SOFT} vertical={false} />
          <XAxis dataKey="yshort" stroke={TEXT_3} tickLine={false}
                 axisLine={{ stroke: RULE }} tick={AXIS_STYLE}
                 interval="preserveStartEnd" />
          <YAxis stroke={TEXT_3} tickLine={false} axisLine={false} tick={AXIS_STYLE}
                 tickFormatter={v => (v/1000).toFixed(1) + 'M'} />
          <Tooltip content={<CustomTooltip
            labelFormatter={l => rows.find(r => r.yshort === l)?.year || l}
            formatter={(v, name) => `${(v*1000).toLocaleString()} (${name})`}
          />} />
          {DISAB_ORDER.slice().reverse().map(code => (
            <Area
              key={code} type="linear"
              dataKey={code} stackId="1"
              name={code}
              stroke={DISAB_COLOR[code]}
              strokeWidth={0.5}
              fill={DISAB_COLOR[code]} fillOpacity={0.85}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ChartFrame>
      <Caption
        n={2}
        title="Stacked composition of IDEA-served students by disability category, n in thousands"
        source="Source — NCES Digest, Table 204.30. fact_national. Categories not yet defined in earlier years (AUT before 1991; DD before 2000; TBI before 1991) appear as gaps in the lower stack."
      >
        Read top-to-bottom. The thick rust-colored base is{' '}
        <strong style={{ color: DISAB_COLOR.SLD }}>SLD</strong>; the navy band above it is{' '}
        <strong style={{ color: DISAB_COLOR.SLI }}>SLI</strong>; the warm taupe wedge that
        widens after 2000 is <strong style={{ color: DISAB_COLOR.OHI }}>OHI</strong>; the sage
        sliver visible only in the right half is <strong style={{ color: DISAB_COLOR.AUT }}>
        AUT</strong>.
      </Caption>
      <DisabilityLegend />
    </Section>
  );
}

function DisabilityLegend() {
  return (
    <div style={{
      marginTop: 18, paddingTop: 14,
      borderTop: `1px solid ${RULE_SOFT}`,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '6px 18px',
    }}>
      {DISAB_ORDER.map(code => (
        <div key={code} style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          fontFamily: SERIF, fontSize: 12, color: TEXT_2,
        }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10,
            background: DISAB_COLOR[code], flexShrink: 0,
          }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_3, minWidth: 30 }}>
            {code}
          </span>
          <span style={{ fontStyle: 'italic' }}>{DATA.disabilities[code][0]}</span>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// SECTION III — CATEGORY TRAJECTORIES (small multiples)
// =====================================================================

function SectionIII() {
  // For each disability, build a sparkline panel: pct_distribution over time
  // (so the y-axis is roughly comparable; share-of-IDEA, not population rate)
  const yrs = [...new Set(DATA.national.map(r => r[0]))].sort();

  const panels = DISAB_ORDER.map(code => {
    const data = yrs.map(yr => {
      const r = DATA.national.find(rr => rr[0] === yr && rr[1] === code);
      return r
        ? { yshort: yearShort(yr), pct: r[3], n: r[2] }
        : { yshort: yearShort(yr), pct: null, n: null };
    });
    const lastWithVal = [...data].reverse().find(d => d.pct != null);
    return { code, data, last: lastWithVal };
  });

  return (
    <Section
      id="III-categories" num={3}
      kicker="Per-category"
      title="Category Trajectories"
      lede="Each panel below shows one disability category as a share of all IDEA-served students, 1976–2023. Where a category did not yet exist as a federal reporting code, the panel is empty in that year."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16, marginTop: 8,
      }}>
        {panels.map(({ code, data, last }) => (
          <div key={code} style={{
            border: `1px solid ${RULE_SOFT}`, padding: '10px 12px 8px 12px',
            background: PAPER_2,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em',
                color: DISAB_COLOR[code],
              }}>
                {code}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_3 }}>
                {last ? last.pct.toFixed(1) + '%' : '—'}
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: TEXT_2, fontStyle: 'italic',
                          marginTop: 2, marginBottom: 4, lineHeight: 1.3, minHeight: 28 }}>
              {DATA.disabilities[code][0]}
            </div>
            <div style={{ height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Line
                    type="linear" dataKey="pct"
                    stroke={DISAB_COLOR[code]} strokeWidth={1.5}
                    dot={false} connectNulls={false}
                    isAnimationActive={false}
                  />
                  <YAxis hide domain={[0, 'dataMax']} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <Caption
        n={3}
        title="Per-category share of all IDEA-served students, 1976–77 → 2022–23"
        source="Source — NCES Digest, Table 204.30. Each panel is independently scaled (y-axis hidden). Last-observation value shown numerically in the upper-right of each panel."
      >
        The two largest categories <strong style={{ color: DISAB_COLOR.SLD }}>SLD</strong> and{' '}
        <strong style={{ color: DISAB_COLOR.SLI }}>SLI</strong> have declined in share since
        2000.{' '}<strong style={{ color: DISAB_COLOR.AUT }}>AUT</strong> and{' '}
        <strong style={{ color: DISAB_COLOR.OHI }}>OHI</strong> have risen monotonically.
        Intellectual&nbsp;Disability (<strong style={{ color: DISAB_COLOR.ID }}>ID</strong>)
        has fallen by more than three-quarters of its 1976 share — partly a reclassification effect into
        OHI and AUT, partly genuine policy shift.
      </Caption>
    </Section>
  );
}


// =====================================================================
// SECTION IV — A GEOGRAPHY OF IDENTIFICATION
// =====================================================================

function SectionIV() {
  // State pct_enrollment 2022-23, sorted desc
  const data2022 = DATA.state_pct
    .filter(r => r[0] === '2022-23' && r[3] != null)
    .map(r => ({ state: r[1], pct: r[3], n: r[2] }))
    .sort((a, b) => b.pct - a.pct);

  // National rate 2022-23
  const natRow = DATA.national.find(r => r[0] === '2022-23' && r[1] === 'ALL');
  const natPct = natRow[4];

  return (
    <Section
      id="IV-geography" num={4}
      kicker="State-level"
      title="A Geography of Identification"
      lede="At the state level the spread is wide enough to be uncomfortable. Pennsylvania reports 21.1 percent of its students receiving IDEA services in 2022–23; Hawaii reports 11.7 percent. The methodology of reporting is the same; the rates differ by a factor of 1.8."
    >
      <StateBarChart data={data2022} natPct={natPct} />
      <Caption
        n={4}
        title="State identification rate, age 3–21, school year 2022–23"
        source="Source — NCES Digest 2023, Table 204.70 (numerator) ÷ Table 203.20 (denominator). fact_state_total. National rate (15.2%) shown as vertical reference line."
      >
        Reading top-to-bottom by rate is informative. The high cluster — Pennsylvania, New York,
        Maine, Massachusetts, Vermont, New Hampshire, West Virginia — does not share an obvious
        confounder. The low cluster — Hawaii, Idaho, Texas, Maryland, Colorado — likewise spans
        starkly different demographics and per-pupil expenditure regimes.
      </Caption>
      <MarginNote>
        State rates are not strictly comparable. Eligibility criteria, RTI/MTSS thresholds,
        and parental-consent law all vary at the state level. Texas in particular operated
        under a documented identification cap from 2004 to 2017; see &sect;&nbsp;XII for the
        flag inventory.
      </MarginNote>
    </Section>
  );
}

function StateBarChart({ data, natPct }) {
  // Custom horizontal bar chart drawn in SVG so we can label every state.
  const N = data.length;
  const ROW_H = 18;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 18;
  const HEIGHT = N * ROW_H + PAD_TOP + PAD_BOTTOM;

  // Range
  const maxV = Math.ceil(Math.max(...data.map(d => d.pct)) + 1);
  const minV = Math.floor(Math.min(...data.map(d => d.pct)) - 1);

  return (
    <div style={{ width: '100%', overflow: 'hidden', marginTop: 16 }}>
      <svg viewBox={`0 0 700 ${HEIGHT}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* axis ticks (top) */}
        {[10, 12, 14, 16, 18, 20, 22].filter(t => t >= minV && t <= maxV).map(t => {
          const x = mapX(t, minV, maxV);
          return (
            <g key={t}>
              <line x1={x} y1={4} x2={x} y2={HEIGHT - 6}
                    stroke={t === Math.round(natPct) ? ACCENT : RULE_SOFT}
                    strokeDasharray={t === Math.round(natPct) ? '0' : '0'} strokeWidth={t === Math.round(natPct) ? 0 : 1} />
              <text x={x} y={HEIGHT - 2}
                    fontFamily={MONO} fontSize={9}
                    fill={TEXT_3} textAnchor="middle"
                    letterSpacing="0.06em">
                {t}%
              </text>
            </g>
          );
        })}

        {/* national reference line */}
        <line x1={mapX(natPct, minV, maxV)} y1={4}
              x2={mapX(natPct, minV, maxV)} y2={HEIGHT - 12}
              stroke={ACCENT} strokeWidth={1} strokeDasharray="2 2" />
        <text x={mapX(natPct, minV, maxV)} y={2}
              fontFamily={MONO} fontSize={9} fill={ACCENT}
              textAnchor="middle"
              letterSpacing="0.06em">
          U.S. {natPct}%
        </text>

        {data.map((d, i) => {
          const y = PAD_TOP + i * ROW_H;
          const x0 = mapX(minV, minV, maxV);
          const x1 = mapX(d.pct, minV, maxV);
          const isHigh = d.pct >= natPct;
          return (
            <g key={d.state}>
              <text x={x0 - 8} y={y + 12}
                    fontFamily={SERIF} fontSize={11} fill={INK} textAnchor="end">
                {d.state}
              </text>
              <rect x={x0} y={y + 4} width={x1 - x0} height={ROW_H - 8}
                    fill={isHigh ? ACCENT_2 : ACCENT}
                    fillOpacity={0.85} />
              <text x={x1 + 4} y={y + 12}
                    fontFamily={MONO} fontSize={10} fill={TEXT_2}>
                {d.pct.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );

  // x mapping helper — left margin 130, right margin 50
  function mapX(v, mn, mx) {
    const left = 130, right = 645;
    return left + ((v - mn) / (mx - mn)) * (right - left);
  }
}

// =====================================================================
// SECTION V — A STATE READ AT THE DISABILITY LEVEL
// =====================================================================

function SectionV() {
  const states = [...new Set(DATA.state_disability_2022.map(r => r[0]))].sort();
  const [picked, setPicked] = useState('California');

  // Composition for picked state
  const stateRows = DATA.state_disability_2022.filter(r => r[0] === picked);
  const all = stateRows.find(r => r[1] === 'ALL');
  const totalAll = all ? all[2] : null;

  // Rows by category, % of state ALL
  const stateComposition = DISAB_ORDER.map(code => {
    const r = stateRows.find(rr => rr[1] === code);
    const n = r ? r[2] : 0;
    const pct = totalAll ? (n / totalAll) * 100 : 0;
    return { code, n, pct };
  });

  // National 2022-23 composition for comparison
  const natComposition = DISAB_ORDER.map(code => {
    const r = DATA.national.find(rr => rr[0] === '2022-23' && rr[1] === code);
    return { code, pct: r ? r[3] : 0 };
  });

  return (
    <Section
      id="V-state-detail" num={5}
      kicker="Picker"
      title="A State Read at the Disability Level"
      lede="Pick a state below to compare its disability composition against the national distribution. The thin gray bars are the U.S. shares; the rust-colored bars are the picked state."
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>State</SmallCaps>
        <select
          value={picked}
          onChange={e => setPicked(e.target.value)}
          style={{
            fontFamily: SERIF, fontSize: 14, color: INK,
            background: PAPER_2, border: `1px solid ${RULE}`,
            padding: '4px 10px', borderRadius: 0, outline: 'none',
          }}
        >
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: TEXT_2 }}>
          n = {fmtNComma(totalAll)} students served, age 3–21
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {stateComposition.map((s, i) => {
          const nat = natComposition[i];
          const maxV = Math.max(...stateComposition.map(x => x.pct), ...natComposition.map(x => x.pct));
          const widthState = (s.pct / maxV) * 100;
          const widthNat   = (nat.pct / maxV) * 100;
          return (
            <div key={s.code} style={{
              display: 'grid',
              gridTemplateColumns: '76px 1fr 60px',
              gap: 10, alignItems: 'center',
              borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 5, paddingBottom: 5,
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: INK }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_3, marginRight: 6 }}>
                  {s.code}
                </span>
                <span style={{ fontStyle: 'italic', color: TEXT_2 }}>
                  {DATA.disabilities[s.code][0]}
                </span>
              </div>
              <div style={{ position: 'relative', height: 18 }}>
                {/* national bar (background) */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: `${widthNat}%`, height: 6,
                  background: TEXT_4, opacity: 0.6,
                }} />
                {/* state bar */}
                <div style={{
                  position: 'absolute', top: 8, left: 0,
                  width: `${widthState}%`, height: 8,
                  background: DISAB_COLOR[s.code],
                }} />
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 11, color: TEXT_2,
                textAlign: 'right', fontVariantNumeric: 'tabular-nums',
              }}>
                {s.pct.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      <Caption
        n={5}
        title={`Disability composition: ${picked} vs. United States, school year 2022–23`}
        source="Source — OSEP Section 618 child-count, fact_state_disability. Background gray bar is the U.S. share; colored bar is the selected state."
      >
        Composition deviations from the national norm are usually traceable to one or two
        categories. For instance, New Jersey runs notably high on{' '}
        <strong style={{ color: DISAB_COLOR.OHI }}>OHI</strong>; Iowa runs high on{' '}
        <strong style={{ color: DISAB_COLOR.SLI }}>SLI</strong>; Texas runs low across the
        board reflecting the legacy 8.5% identification cap (2004–2017).
      </Caption>
    </Section>
  );
}

// =====================================================================
// SECTION VI — STATE TRAJECTORIES
// =====================================================================

function SectionVI() {
  // We have state pct for 9 timepoints (1990, 2000, 2010, 2015, 2018-2022)
  // Build a multi-line chart with state selection (toggle on/off).
  const allYears = [...new Set(DATA.state_pct.map(r => r[0]))].sort();

  // Build {state: [{y, pct}, ...]}
  const byState = {};
  for (const r of DATA.state_pct) {
    if (r[3] == null) continue;
    if (!byState[r[1]]) byState[r[1]] = [];
    byState[r[1]].push({ year: r[0], yshort: yearShort(r[0]), pct: r[3] });
  }
  Object.values(byState).forEach(arr => arr.sort((a,b) => a.year.localeCompare(b.year)));

  const allStates = Object.keys(byState).sort();
  const [picked, setPicked] = useState(['Pennsylvania','New York','Hawaii','Texas','California']);

  const togglestate = (s) => {
    setPicked(prev => prev.includes(s)
      ? prev.filter(x => x !== s)
      : prev.length < 8 ? [...prev, s] : prev);
  };

  // Build wide rows
  const wide = allYears.map(yr => {
    const obj = { year: yr, yshort: yearShort(yr) };
    for (const s of picked) {
      const rec = byState[s]?.find(d => d.year === yr);
      obj[s] = rec ? rec.pct : null;
    }
    return obj;
  });

  // National line for context
  const natWide = allYears.map(yr => {
    const r = DATA.national.find(rr => rr[0] === yr && rr[1] === 'ALL');
    return { yshort: yearShort(yr), pct: r ? r[4] : null };
  });

  return (
    <Section
      id="VI-trajectories" num={6}
      kicker="Multi-state"
      title="State Trajectories"
      lede="The same nine reporting points read very differently if drawn state-by-state. High-rate states have stayed high; low-rate states have stayed low. Toggle states below; up to eight at a time."
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {allStates.map(s => {
          const on = picked.includes(s);
          return (
            <button
              key={s}
              onClick={() => togglestate(s)}
              style={{
                fontFamily: SERIF, fontSize: 11, padding: '3px 8px',
                background: on ? INK : 'transparent',
                color: on ? PAPER : TEXT_2,
                border: `1px solid ${on ? INK : RULE}`,
                cursor: 'pointer', borderRadius: 0,
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <ChartFrame height={340}>
        <LineChart data={wide} margin={{ top: 18, right: 70, bottom: 12, left: -8 }}>
          <CartesianGrid stroke={RULE_SOFT} vertical={false} />
          <XAxis dataKey="yshort" stroke={TEXT_3} tickLine={false}
                 axisLine={{ stroke: RULE }} tick={AXIS_STYLE} />
          <YAxis stroke={TEXT_3} tickLine={false} axisLine={false}
                 tick={AXIS_STYLE} domain={[8, 22]}
                 tickFormatter={v => v + '%'} />
          <Tooltip content={<CustomTooltip
            labelFormatter={l => wide.find(w => w.yshort === l)?.year || l}
            formatter={(v) => v == null ? '—' : v.toFixed(1) + '%'}
          />} />
          {/* National reference */}
          <Line data={natWide} dataKey="pct"
                stroke={INK} strokeWidth={1} strokeDasharray="2 4"
                dot={false} name="U.S."
                isAnimationActive={false} />
          {picked.map((s, i) => (
            <Line key={s} dataKey={s}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={1.6}
                  dot={{ r: 2, fill: PALETTE[i % PALETTE.length] }}
                  connectNulls={true}
                  isAnimationActive={false} />
          ))}
        </LineChart>
      </ChartFrame>
      <Caption
        n={6}
        title="State identification rate, age 3–21, available NCES timepoints"
        source="Source — NCES Digest 2023, Table 204.70. fact_state_total, 9 timepoints (1990, 2000, 2010, 2015, 2018, 2019, 2020, 2021, 2022). U.S. line dashed in ink for reference."
      >
        Rate-rank stability is the dominant feature. Pennsylvania has been at the top of the
        distribution since at least 2010; Hawaii at the bottom over the same span. Texas
        trended noticeably upward from 2018 onward — the post-cap correction visible in the data.
      </Caption>
    </Section>
  );
}


// =====================================================================
// SECTION VII — SEX ASYMMETRIES
// =====================================================================

function SectionVII() {
  const sexLatest = useMemo(() => {
    const rows = DATA.sex_disability.filter(r => r[0] === '2022-23');
    const map = {}; // code -> {M,F}
    rows.forEach(([yr, sex, code, n]) => {
      if (!map[code]) map[code] = { code, M: 0, F: 0 };
      map[code][sex] = n;
    });
    const arr = Object.values(map)
      .filter(r => r.code !== 'ALL')
      .map(r => ({
        ...r,
        total: r.M + r.F,
        ratio: r.F > 0 ? r.M / r.F : 0,
        pctM: r.M / (r.M + r.F) * 100,
      }))
      .sort((a, b) => b.ratio - a.ratio);
    return arr;
  }, []);

  const allRow = DATA.sex_disability.find(r => r[0] === '2022-23' && r[1] === 'M' && r[2] === 'ALL');
  const allRowF = DATA.sex_disability.find(r => r[0] === '2022-23' && r[1] === 'F' && r[2] === 'ALL');
  const allRatio = allRow[3] / allRowF[3];
  const allPctM  = allRow[3] / (allRow[3] + allRowF[3]) * 100;

  // Custom SVG diverging bar
  const w = 720, h = sexLatest.length * 30 + 40;
  const center = w * 0.42;
  const maxN = Math.max(...sexLatest.map(r => Math.max(r.M, r.F)));
  const scale = (w - center - 80) / maxN;
  const fScale = (center - 110) / maxN;
  const rowH = 24;

  return (
    <Section
      id="VII-sex" num={7}
      kicker="Sex"
      title="Sex Asymmetries"
      lede="The IDEA-served population is predominantly male. The asymmetry is sharpest in autism and emotional disturbance, gentlest in specific learning disability and intellectual disability. The pattern is durable across decades and is not an artifact of any single year."
    >
      <ChartFrame height={h + 24}>
        <svg viewBox={`0 0 ${w} ${h + 24}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
          {/* axis labels */}
          <text x={center - 110} y={16} style={AXIS_STYLE} textAnchor="end">FEMALE  ←</text>
          <text x={center + 110} y={16} style={AXIS_STYLE} textAnchor="start">→  MALE</text>
          <line x1={center} y1={20} x2={center} y2={h - 8} stroke={INK} strokeWidth={0.5} />

          {sexLatest.map((r, i) => {
            const y0 = 30 + i * 30;
            const fW = r.F * fScale;
            const mW = r.M * scale;
            const c = DISAB_COLOR[r.code] || ACCENT;
            return (
              <g key={r.code}>
                <text x={center - 6} y={y0 + rowH * 0.7}
                      style={{ ...AXIS_STYLE, fontSize: 11, fontFamily: SERIF }} fill={INK} textAnchor="end">
                  {r.code}
                </text>
                {/* Female bar — left */}
                <rect x={center - fW} y={y0} width={fW} height={rowH * 0.62} fill={c} opacity={0.45} />
                <text x={center - fW - 6} y={y0 + rowH * 0.5}
                      style={{ ...AXIS_STYLE, fontFamily: MONO }} fill={TEXT_2} textAnchor="end">
                  {fmtNComma(r.F)}
                </text>
                {/* Male bar — right */}
                <rect x={center} y={y0} width={mW} height={rowH * 0.62} fill={c} />
                <text x={center + mW + 6} y={y0 + rowH * 0.5}
                      style={{ ...AXIS_STYLE, fontFamily: MONO }} fill={TEXT_2}>
                  {fmtNComma(r.M)}
                </text>
                {/* Ratio annotation */}
                <text x={center + mW + 80} y={y0 + rowH * 0.5}
                      style={{ ...AXIS_STYLE, fontFamily: SERIF, fontStyle: 'italic', fontSize: 11 }}
                      fill={i < 3 ? ACCENT : TEXT_2}>
                  {r.ratio.toFixed(2)}× male
                </text>
              </g>
            );
          })}
        </svg>
      </ChartFrame>
      <Caption
        n={7}
        title="Male-to-female ratio by disability category, age 6–21, school year 2022–23"
        source="Source — fact_state_disability_sex (50 states + DC). Ratio computed M ÷ F. Categories ordered by descending ratio. Across all categories the pooled ratio is 1.87 (males 65.2% of total)."
      >
        Autism leads at <strong>4.4× male</strong>; emotional disturbance follows at 2.3×.
        Specific learning disability and intellectual disability are the lowest among the major
        categories (1.34× and 1.41× respectively). The pooled ratio masks a roughly threefold
        spread across categories, which is the finding worth carrying.
      </Caption>
      <MarginNote>
        The male-skew in autism and emotional disturbance is a long-standing finding in clinical and
        epidemiological literature; what the panel adds is that it is uniform across reporting
        states and stable from 2012 forward — not the artifact of any one cohort.
      </MarginNote>
    </Section>
  );
}

// =====================================================================
// SECTION VIII — RACE & ETHNICITY
// =====================================================================

function SectionVIII() {
  const races = ['WHITE','HISP','BLACK','ASIAN','TWO_PLUS','AIAN','NHPI'];

  // 2022-23, all 50+DC, ALL row composition
  const allRows = DATA.race_disability.filter(r => r[0] === '2022-23' && r[2] === 'ALL');
  const allTotal = allRows.reduce((s, r) => races.includes(r[1]) ? s + r[3] : s, 0);
  const allComp = {}; allRows.forEach(r => { if (races.includes(r[1])) allComp[r[1]] = r[3] / allTotal * 100; });

  // For each major disability, race composition
  const codes = ['SLD','SLI','OHI','AUT','DD','ID','ED','MD','HI','VI'];
  const rows = codes.map(code => {
    const cells = DATA.race_disability.filter(r => r[0] === '2022-23' && r[2] === code);
    const total = cells.reduce((s, r) => races.includes(r[1]) ? s + r[3] : s, 0);
    const comp = {};
    cells.forEach(r => { if (races.includes(r[1])) comp[r[1]] = r[3] / total * 100; });
    return { code, total, comp };
  });

  const w = 720, rowH = 36, h = (rows.length + 2) * rowH + 30;
  const labelW = 70, barX = labelW + 10, barW = w - barX - 80;

  return (
    <Section
      id="VIII-race" num={8}
      kicker="Race & ethnicity"
      title="Race &amp; Ethnicity"
      lede="Each disability category has a distinct racial composition. Black students are over-represented in intellectual disability and emotional disturbance; Hispanic students appear at higher shares in speech-language; the autism category most closely tracks the population baseline. Read each row against the topmost <em>All Disabilities</em> reference."
    >
      <ChartFrame height={h + 60}>
        <svg viewBox={`0 0 ${w} ${h + 60}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
          {/* legend */}
          <g transform="translate(0, 4)">
            {races.map((rc, i) => (
              <g key={rc} transform={`translate(${i * 100}, 0)`}>
                <rect x={0} y={0} width={10} height={10} fill={RACE_COLOR[rc]} />
                <text x={14} y={9} style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11 }} fill={INK}>{rc}</text>
              </g>
            ))}
          </g>
          {/* baseline row */}
          <g transform="translate(0, 30)">
            <text x={labelW} y={rowH * 0.6}
                  style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11, fontWeight: 600 }} fill={INK} textAnchor="end">
              ALL
            </text>
            <text x={labelW} y={rowH * 0.95}
                  style={{ ...AXIS_STYLE, fontFamily: MONO, fontSize: 9 }} fill={TEXT_3} textAnchor="end">
              baseline
            </text>
            {(() => {
              let cum = 0;
              return races.map(rc => {
                const pct = allComp[rc] || 0;
                const x0 = barX + barW * (cum / 100);
                const segW = barW * (pct / 100);
                cum += pct;
                return (
                  <g key={rc}>
                    <rect x={x0} y={6} width={segW} height={rowH * 0.55} fill={RACE_COLOR[rc]} />
                    {pct > 5 && (
                      <text x={x0 + segW / 2} y={rowH * 0.4}
                            style={{ ...AXIS_STYLE, fontFamily: MONO, fontSize: 9 }} fill={PAPER} textAnchor="middle">
                        {pct.toFixed(0)}
                      </text>
                    )}
                  </g>
                );
              });
            })()}
            <line x1={barX} y1={rowH + 4} x2={barX + barW} y2={rowH + 4} stroke={INK} strokeWidth={0.4} strokeDasharray="2,2" />
          </g>
          {/* rows */}
          {rows.map((r, i) => {
            const yTop = 30 + (i + 1) * rowH + 10;
            let cum = 0;
            return (
              <g key={r.code} transform={`translate(0, ${yTop})`}>
                <text x={labelW} y={rowH * 0.6}
                      style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11 }} fill={INK} textAnchor="end">
                  {r.code}
                </text>
                <text x={labelW} y={rowH * 0.95}
                      style={{ ...AXIS_STYLE, fontFamily: MONO, fontSize: 9 }} fill={TEXT_3} textAnchor="end">
                  {fmtN(r.total)}
                </text>
                {races.map(rc => {
                  const pct = r.comp[rc] || 0;
                  const x0 = barX + barW * (cum / 100);
                  const segW = barW * (pct / 100);
                  cum += pct;
                  return (
                    <g key={rc}>
                      <rect x={x0} y={6} width={segW} height={rowH * 0.55} fill={RACE_COLOR[rc]} />
                      {pct > 6 && (
                        <text x={x0 + segW / 2} y={rowH * 0.4}
                              style={{ ...AXIS_STYLE, fontFamily: MONO, fontSize: 9 }} fill={PAPER} textAnchor="middle">
                          {pct.toFixed(0)}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* overrep flag — Black share */}
                {(() => {
                  const black = r.comp.BLACK || 0;
                  const baseline = allComp.BLACK || 0;
                  const ratio = baseline > 0 ? black / baseline : 1;
                  if (ratio >= 1.25) {
                    return (
                      <text x={barX + barW + 6} y={rowH * 0.5}
                            style={{ ...AXIS_STYLE, fontFamily: SERIF, fontStyle: 'italic', fontSize: 10 }}
                            fill={ACCENT}>
                        Black {ratio.toFixed(2)}×
                      </text>
                    );
                  }
                  return null;
                })()}
              </g>
            );
          })}
        </svg>
      </ChartFrame>
      <Caption
        n={8}
        title="Race / ethnicity composition by disability category, age 6–21, school year 2022–23"
        source="Source — fact_state_disability_race (50 states + DC, OMB 1997 categories). Top row is the IDEA-served baseline. Risk-ratio annotation flags Black students at ≥ 1.25× baseline share."
      >
        Intellectual disability and emotional disturbance present the sharpest Black over-representation
        relative to the served population baseline. Speech-language is the only category in which Hispanic
        share materially exceeds the baseline. Autism most closely tracks the baseline composition — a
        notable inversion of patterns reported in older U.S. data.
      </Caption>
      <MarginNote>
        These shares describe composition <em>within</em> the IDEA-served population; they are not
        identification rates against the full racial population denominator. A complete risk-ratio
        analysis would require NCES racial enrollment by state — out of scope for this monograph.
      </MarginNote>
    </Section>
  );
}

// =====================================================================
// SECTION IX — ENGLISH LEARNERS
// =====================================================================

function SectionIX() {
  const lepLatest = useMemo(() => {
    const rows = DATA.lep_disability.filter(r => r[0] === '2022-23');
    const map = {};
    rows.forEach(([yr, lep, code, n]) => {
      if (!map[code]) map[code] = { code, YES: 0, NO: 0 };
      map[code][lep === 'LEP_YES' ? 'YES' : 'NO'] = n;
    });
    return Object.values(map)
      .filter(r => r.code !== 'ALL')
      .map(r => ({ ...r, total: r.YES + r.NO, pctEL: r.YES / (r.YES + r.NO) * 100 }))
      .sort((a, b) => b.pctEL - a.pctEL);
  }, []);

  // Baseline: all IDEA-served EL%
  const allYes = DATA.lep_disability.find(r => r[0] === '2022-23' && r[1] === 'LEP_YES' && r[2] === 'ALL')[3];
  const allNo  = DATA.lep_disability.find(r => r[0] === '2022-23' && r[1] === 'LEP_NO'  && r[2] === 'ALL')[3];
  const baselineEL = allYes / (allYes + allNo) * 100;

  return (
    <Section
      id="IX-el" num={9}
      kicker="English learners"
      title="English Learners Within IDEA"
      lede="The English-learner share of IDEA-served students is 12.1 percent overall, but the across-category range is wide. Specific learning disability concentrates English learners; emotional disturbance, other health impairment, and traumatic brain injury do not."
    >
      <ChartFrame height={Math.max(280, lepLatest.length * 32 + 40)}>
        <BarChart
          layout="vertical"
          data={lepLatest}
          margin={{ top: 12, right: 60, bottom: 12, left: 36 }}
        >
          <CartesianGrid stroke={RULE_SOFT} horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']}
                 tick={AXIS_STYLE} stroke={RULE} tickLine={false}
                 tickFormatter={v => v + '%'} />
          <YAxis type="category" dataKey="code"
                 tick={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11, fill: INK }}
                 stroke={RULE} tickLine={false} width={36} />
          <ReferenceLine x={baselineEL} stroke={INK} strokeDasharray="3,3"
                         label={{ value: `IDEA baseline ${baselineEL.toFixed(1)}%`,
                                  position: 'right', fill: INK, fontSize: 10, fontFamily: MONO }} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => `Disability ${l}`}
              formatter={(v, n) => n === 'pctEL' ? v.toFixed(1) + '%' : fmtNComma(v)}
            />}
          />
          <Bar dataKey="pctEL" fill={ACCENT} radius={0}>
            {lepLatest.map((r, i) => (
              <Cell key={i} fill={r.pctEL > baselineEL ? ACCENT : ACCENT_2} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>
      <Caption
        n={9}
        title="English-learner share within each disability category, age 6–21, school year 2022–23"
        source="Source — fact_state_disability_lep (50 states + DC). Bars are LEP_YES ÷ (LEP_YES + LEP_NO) within each disability code. Reference line is the pooled IDEA-served EL share."
      >
        Specific learning disability leads at <strong>15.2%</strong> EL — three percentage points
        above baseline. Intellectual disability (13.7%) and developmental delay (13.5%) follow.
        The categories deepest below baseline are emotional disturbance (4.6%) and other health
        impairment (6.9%) — patterns consistent with what is known about referral pathways and
        assessment language.
      </Caption>
    </Section>
  );
}


// =====================================================================
// SECTION X — WHERE CHILDREN ARE SERVED  (LRE / environment)
// =====================================================================

const ENV_LABEL_6_21 = {
  INSIDE_80_PLUS: 'Inside ≥80% of day',
  INSIDE_40_79:   'Inside 40–79%',
  INSIDE_LT_40:   'Inside <40%',
  SEPARATE_SCHOOL:'Separate school',
  RESIDENTIAL:    'Residential facility',
  HOMEBOUND:      'Homebound / hospital',
  CORRECTIONAL:   'Correctional facility',
  PARENTAL_PRIVATE:'Parentally placed (private)',
};
const ENV_LABEL_3_5 = {
  EC_REG_GE10:    'EC reg. setting (≥10 hrs)',
  EC_REG_LT10:    'EC reg. setting (<10 hrs)',
  EC_OTHER_GE10:  'Other EC setting (≥10 hrs)',
  EC_OTHER_LT10:  'Other EC setting (<10 hrs)',
  SEPARATE_CLASS: 'Separate class',
  SEPARATE_SCHOOL:'Separate school',
  HOME:           'Home',
  RESIDENTIAL:    'Residential facility',
  SERVICE_PROVIDER:'Service-provider location',
};

function buildEnvSeries(rows, order) {
  const byYear = {};
  rows.forEach(([yr, code, n]) => {
    if (!byYear[yr]) byYear[yr] = { year: yr, _total: 0 };
    byYear[yr][code] = (byYear[yr][code] || 0) + n;
    byYear[yr]._total += n;
  });
  return Object.values(byYear)
    .map(o => {
      const out = { year: o.year };
      order.forEach(c => { out[c] = o._total > 0 ? (o[c] || 0) / o._total * 100 : 0; });
      return out;
    })
    .sort((a, b) => a.year.localeCompare(b.year));
}

function SectionX() {
  const series621 = useMemo(() => buildEnvSeries(DATA.env_6_21, ENV_ORDER_6_21), []);
  const series35  = useMemo(() => buildEnvSeries(DATA.env_3_5, ENV_ORDER_3_5), []);

  // Headline figure: 2022-23 INSIDE_80_PLUS share
  const last621 = series621[series621.length - 1];
  const first621 = series621[0];

  return (
    <Section
      id="X-environment" num={10}
      kicker="Educational environment"
      title="Where Children Are Served"
      lede="The least-restrictive-environment principle is observable in the data: the share of school-age children educated alongside non-disabled peers for at least 80 percent of the day has risen from 64 percent in 2012 to nearly 70 percent in 2022. The early-childhood picture is more crowded — and more interesting."
    >
      <h3 style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 16, marginBottom: 4, fontWeight: 400 }}>
        School-age (6–21)
      </h3>

      <ChartFrame height={320}>
        <AreaChart data={series621} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <CartesianGrid stroke={RULE_SOFT} horizontal vertical={false} />
          <XAxis dataKey="year" tickFormatter={yearTwo} tick={AXIS_STYLE} stroke={RULE} tickLine={false} />
          <YAxis tick={AXIS_STYLE} stroke={RULE} tickLine={false}
                 tickFormatter={v => v + '%'} domain={[0, 100]} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => `School year ${l}`}
              formatter={(v) => v.toFixed(1) + '%'}
            />}
          />
          {ENV_ORDER_6_21.map(c => (
            <Area
              key={c}
              type="linear"
              dataKey={c}
              stackId="1"
              stroke={ENV_COLOR_6_21[c]}
              fill={ENV_COLOR_6_21[c]}
              fillOpacity={0.92}
              name={ENV_LABEL_6_21[c]}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ChartFrame>

      <Caption
        n={10}
        title="Educational environment composition, age 6–21, 2012–13 through 2024–25"
        source="Source — fact_state_disability_environment (50 states + DC). Shares sum to 100% within each year. Eight federally-defined placement categories."
      >
        The dominant green band — <em>Inside ≥80% of day</em> — has expanded from{' '}
        <strong>{first621.INSIDE_80_PLUS.toFixed(1)}%</strong> to{' '}
        <strong>{last621.INSIDE_80_PLUS.toFixed(1)}%</strong> over the panel. The corresponding
        contraction has fallen mainly on <em>Inside 40–79%</em> and <em>Inside &lt; 40%</em>;
        separate-school and residential placement together remain at roughly 4% of the served
        population, essentially flat across the panel.
      </Caption>

      <h3 style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 36, marginBottom: 4, fontWeight: 400 }}>
        Early childhood (3–5)
      </h3>

      <ChartFrame height={320}>
        <AreaChart data={series35} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <CartesianGrid stroke={RULE_SOFT} horizontal vertical={false} />
          <XAxis dataKey="year" tickFormatter={yearTwo} tick={AXIS_STYLE} stroke={RULE} tickLine={false} />
          <YAxis tick={AXIS_STYLE} stroke={RULE} tickLine={false}
                 tickFormatter={v => v + '%'} domain={[0, 100]} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => `School year ${l}`}
              formatter={(v) => v.toFixed(1) + '%'}
            />}
          />
          {ENV_ORDER_3_5.map(c => (
            <Area
              key={c}
              type="linear"
              dataKey={c}
              stackId="2"
              stroke={ENV_COLOR_3_5[c] || RULE}
              fill={ENV_COLOR_3_5[c] || RULE}
              fillOpacity={0.92}
              name={ENV_LABEL_3_5[c] || c}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ChartFrame>

      <Caption
        n={11}
        title="Educational environment composition, age 3–5, 2012–13 through 2024–25"
        source="Source — fact_state_disability_environment (50 states + DC). Categories distinct from the 6–21 schema; share definitions in the federal early-childhood placement framework."
      >
        Early-childhood placements are dominated by <em>Other EC settings (≥10 hrs)</em> and
        <em> Regular EC settings (≥10 hrs)</em>. The crossover between these two bands is the most
        visible structural change in the panel — a separate analysis question worth pursuing once
        state-level pre-K policy variation is layered in.
      </Caption>
    </Section>
  );
}

// =====================================================================
// SECTION XI — THE AGE PROFILE
// =====================================================================

function SectionXI() {
  // Single-age curve, 2022-23, ALL
  const ageLatest = useMemo(() => {
    return DATA.age_all_ts
      .filter(r => r[0] === '2022-23')
      .map(r => ({ age: r[1], n: r[2] }))
      .sort((a, b) => a.age - b.age);
  }, []);

  // Age × disability breakdown — 2011-12 (last year with breakdown)
  const ageDisab2011 = useMemo(() => {
    const codes = ['SLD','SLI','OHI','AUT','ED','ID','MD','DD','HI','OI','VI','TBI','DB'];
    const byAge = {};
    DATA.age_disability_2011.forEach(([age, code, n]) => {
      if (!byAge[age]) { byAge[age] = { age }; }
      byAge[age][code] = n;
    });
    return Object.values(byAge).sort((a, b) => a.age - b.age);
  }, []);

  // Peak age in 2022-23
  const peakRow = ageLatest.reduce((a, b) => (b.n > a.n ? b : a), { n: 0 });

  // Small-multiples disability list
  const smCodes = ['SLD','SLI','OHI','AUT','ED','ID','DD','HI','VI','MD','OI','TBI'];

  return (
    <Section
      id="XI-age" num={11}
      kicker="Age"
      title="The Age Profile"
      lede="The cross-sectional age profile peaks in late elementary years and declines through high-school. The shape varies sharply by category — speech-language collapses by age twelve, autism rises through middle school, intellectual disability holds nearly flat. The breakdown by single-year-of-age × disability is only available for the 2005–2011 reporting window in the current panel; the pooled single-age curve runs to 2022–23."
    >
      <ChartFrame height={300}>
        <BarChart data={ageLatest} margin={{ top: 12, right: 12, bottom: 24, left: 12 }}>
          <CartesianGrid stroke={RULE_SOFT} vertical={false} />
          <XAxis dataKey="age" tick={AXIS_STYLE} stroke={RULE} tickLine={false}
                 label={{ value: 'Age (years)', position: 'insideBottom', offset: -8, fill: TEXT_3,
                          fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em' }} />
          <YAxis tick={AXIS_STYLE} stroke={RULE} tickLine={false} tickFormatter={fmtN} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => `Age ${l}`}
              formatter={(v) => fmtNComma(v)}
            />}
          />
          <ReferenceLine x={peakRow.age} stroke={ACCENT} strokeDasharray="3,3"
                         label={{ value: `peak: age ${peakRow.age} (${fmtN(peakRow.n)})`,
                                  position: 'top', fill: ACCENT, fontSize: 10, fontFamily: MONO }} />
          <Bar dataKey="n" fill={ACCENT_2} radius={0} />
        </BarChart>
      </ChartFrame>
      <Caption
        n={12}
        title="Single-year age distribution of IDEA-served children, school year 2022–23, all categories pooled"
        source="Source — fact_state_disability_age_single, 50 states + DC, ALL disabilities. Bars are headcounts. Pre-school ages 3–5 included; aged-out at 21."
      >
        The mode sits at age {peakRow.age}, after which counts fall steadily. The pre-school plateau
        (ages 3–5) reflects early-intervention transition into Part B services. The cliff after age
        18 is administrative — not biological — as students exit IDEA services on graduation or at
        age 22.
      </Caption>

      <h3 style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 36, marginBottom: 4, fontWeight: 400 }}>
        Age × disability profile, 2011–12 (last year with breakdown)
      </h3>
      <p style={{ fontFamily: SERIF, fontSize: 13, color: TEXT_2, lineHeight: 1.6, maxWidth: 640 }}>
        Each panel is the age distribution within a single disability category. The y-axes are
        unique to each panel (the categories differ in size by orders of magnitude); the x-axis is
        common (ages 3–21). Read the shape, not the height.
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginTop: 12,
      }}>
        {smCodes.map(code => {
          const series = ageDisab2011
            .map(r => ({ age: r.age, n: r[code] || 0 }))
            .filter(r => r.age >= 3 && r.age <= 21);
          const maxN = Math.max(...series.map(r => r.n));
          if (maxN === 0) return null;
          const w = 180, h = 80, pad = 4;
          return (
            <div key={code} style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: SERIF, fontSize: 12, color: INK, fontWeight: 500 }}>{code}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: TEXT_3 }}>peak {fmtN(maxN)}</span>
              </div>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 4 }}>
                {series.map((r, i) => {
                  const bw = (w - pad * 2) / series.length;
                  const bh = maxN > 0 ? (r.n / maxN) * (h - pad * 2) : 0;
                  return (
                    <rect
                      key={i}
                      x={pad + i * bw}
                      y={h - pad - bh}
                      width={bw - 1}
                      height={bh}
                      fill={DISAB_COLOR[code] || ACCENT}
                    />
                  );
                })}
                <text x={pad} y={h - 1} style={{ fontFamily: MONO, fontSize: 7 }} fill={TEXT_3}>3</text>
                <text x={w - pad - 8} y={h - 1} style={{ fontFamily: MONO, fontSize: 7 }} fill={TEXT_3}>21</text>
              </svg>
            </div>
          );
        })}
      </div>
      <Caption
        n={13}
        title="Single-year age distribution within each disability category, school year 2011–12"
        source="Source — fact_state_disability_age_single, 50 states + DC. After 2011-12 the panel collapses to ALL only; this view is the last fully-resolved snapshot."
      >
        Speech-language is concentrated in early elementary (peak at age 6); intellectual
        disability rises through age 17, while autism peaks early (age 8) and declines gently
        through the teens; emotional disturbance peaks at age 16. Hearing and visual impairment
        are nearly flat across the school-age span — consistent with their etiology as
        long-standing congenital or early-acquired conditions.
      </Caption>
      <MarginNote>
        The collapse of single-age × specific-disability reporting after 2011-12 is the largest
        visible coverage loss in the panel. Reinstating it would unlock cohort-level analysis
        currently impossible with public data.
      </MarginNote>
    </Section>
  );
}


// =====================================================================
// SECTION XII — DATA-QUALITY INVENTORY
// =====================================================================

const DQ_LABEL = {
  RECLASSIFICATION_AGE5_PREBREAK: 'Age-5 reclassification (pre-break)',
  OSEP_TOTAL_VS_ENV_MISMATCH:     'OSEP total vs environment mismatch',
  IMPUTED_PK:                     'Imputed pre-K denominator',
  COMPUTED_RATE:                  'Computed rate (cross-check)',
  BACKFILL:                       'Back-filled cell',
  IMPUTED:                        'Imputed value',
  BACKFILL_AGE3_5:                'Back-fill, age 3–5',
  BACKFILL_AGE6_21:               'Back-fill, age 6–21',
  COVID:                          'COVID-period anomaly',
  DEFINITION_CHANGE:              'Definition change',
  MISSING:                        'Missing cell',
  BACKFILL_AGE5_21:               'Back-fill, age 5–21',
  LOUISIANA_2020_21_PARTIAL_NCES_FOOTNOTE3: 'Louisiana 2020-21 partial (NCES fn3)',
  LOUISIANA_2021_22_PARTIAL_NCES_FOOTNOTE4: 'Louisiana 2021-22 partial (NCES fn4)',
  'P2-3-OMB-NONE-2009':           'P2-3 OMB-none (2009)',
  RECLASSIFICATION_AGE5:          'Age-5 reclassification',
  STATE_POLICY:                   'State-policy anomaly',
  TERMINOLOGY_CHANGE:             'Terminology change',
  WISCONSIN_2019_20_NCES_FOOTNOTE5: 'Wisconsin 2019-20 (NCES fn5)',
};

const DQ_CLASS_COLOR = {
  PRIMARY:                  ACCENT_2,
  INFERRED_FROM_ANOMALY:    ACCENT,
  CROSSCHECK:               '#806d51',
};

function SectionXII() {
  const dq = useMemo(() => {
    return DATA.dq_summary
      .map(([code, cls, n]) => ({ code, cls, n, label: DQ_LABEL[code] || code }))
      .sort((a, b) => b.n - a.n);
  }, []);
  const dqYears = useMemo(() => {
    return DATA.dq_by_year
      .map(([yr, n]) => ({ year: yr, n }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, []);
  const total = DATA.dq_total;

  // Class totals for footer
  const classTotals = {};
  dq.forEach(r => { classTotals[r.cls] = (classTotals[r.cls] || 0) + r.n; });

  return (
    <Section
      id="XII-dq" num={12}
      kicker="Provenance"
      title="Data-Quality Inventory"
      lede="The panel ships its caveats inline. Seventy-nine flags are recorded across the build, organized by source class — primary observation, inference from anomaly, or cross-check against an outside table. The largest single bucket (twenty-two flags) is the federal age-5 reclassification carried forward across the panel before the methodological break in 2018."
    >
      <ChartFrame height={Math.max(360, dq.length * 22 + 40)}>
        <BarChart
          layout="vertical"
          data={dq}
          margin={{ top: 12, right: 36, bottom: 12, left: 220 }}
        >
          <CartesianGrid stroke={RULE_SOFT} horizontal={false} />
          <XAxis type="number" tick={AXIS_STYLE} stroke={RULE} tickLine={false}
                 allowDecimals={false} />
          <YAxis type="category" dataKey="label"
                 tick={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11, fill: INK }}
                 stroke={RULE} tickLine={false} width={216} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => l}
              formatter={(v, n, p) => `${v} flags · ${p.payload.cls}`}
            />}
          />
          <Bar dataKey="n" radius={0}>
            {dq.map((r, i) => <Cell key={i} fill={DQ_CLASS_COLOR[r.cls] || TEXT_3} />)}
          </Bar>
        </BarChart>
      </ChartFrame>

      {/* Inline legend */}
      <div style={{
        display: 'flex', gap: 24, marginTop: 8, fontFamily: SERIF, fontSize: 12, color: TEXT_2,
        flexWrap: 'wrap',
      }}>
        {Object.entries(classTotals).map(([cls, n]) => (
          <span key={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: DQ_CLASS_COLOR[cls] }} />
            <span style={{ fontVariant: 'small-caps', letterSpacing: '0.08em' }}>{cls.replace(/_/g, ' ').toLowerCase()}</span>
            <span style={{ fontFamily: MONO, color: TEXT_3 }}>{n}</span>
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: TEXT_3 }}>
          TOTAL · {total} flags
        </span>
      </div>

      <Caption
        n={14}
        title="Data-quality flag inventory by issue type and source class"
        source="Source — meta_dataquality (79 rows). Source class indicates whether the flag is a primary observation, an anomaly-inferred caveat, or the result of cross-checking computed rates against NCES tables 204.30 / 204.70."
      >
        Two patterns dominate. <em>Reclassification age-5 pre-break</em> (22 flags) is a methodological
        break introduced when OSEP shifted the age-5 boundary in the 2018 reporting cycle; the panel
        carries a flag on every cell affected by the prior boundary. <em>OSEP total vs environment
        mismatch</em> (19) is an internal-consistency issue surfaced during ETL — the disability
        total in one OSEP file does not match the environment-disaggregated cells in another, year
        by year.
      </Caption>

      <h3 style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 36, marginBottom: 4, fontWeight: 400 }}>
        Flag concentration by school year
      </h3>
      <ChartFrame height={220}>
        <BarChart data={dqYears} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <CartesianGrid stroke={RULE_SOFT} vertical={false} />
          <XAxis dataKey="year" tickFormatter={yearTwo} tick={AXIS_STYLE} stroke={RULE} tickLine={false} />
          <YAxis tick={AXIS_STYLE} stroke={RULE} tickLine={false} allowDecimals={false} />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={l => `School year ${l}`}
              formatter={v => `${v} flags`}
            />}
          />
          <Bar dataKey="n" fill={ACCENT} radius={0} />
        </BarChart>
      </ChartFrame>
      <Caption
        n={15}
        title="Flag concentration by school year"
        source="Source — meta_dataquality, grouped by school_year. Years with zero flags are omitted."
      >
        The concentration around 2017–2020 reflects the federal age-5 break and the COVID-era
        reporting irregularities; the long tail back to 2007 is the pre-OMB-1997 carry-forward.
      </Caption>
    </Section>
  );
}

// =====================================================================
// SECTION XIII — COVERAGE MATRIX
// =====================================================================

const FACT_TABLE_LABEL = {
  fact_national:                       'National totals',
  fact_state_total:                    'State totals',
  fact_state_disability:               'State × disability',
  fact_state_disability_environment:   'State × disab × environment',
  fact_state_disability_race:          'State × disab × race',
  fact_state_disability_sex:           'State × disab × sex',
  fact_state_disability_lep:           'State × disab × LEP',
  fact_state_disability_age_single:    'State × disab × single age',
  fact_state_enrollment:               'State enrollment (NCES)',
};

function SectionXIII() {
  const coverage = DATA.coverage;

  // Master year list — union of all years across tables
  const yearsSet = new Set();
  Object.values(coverage).forEach(o => Object.keys(o).forEach(y => yearsSet.add(y)));
  const years = [...yearsSet].sort();

  const tables = Object.keys(coverage);

  const w = 880, labelW = 220, cellW = (w - labelW - 60) / years.length;
  const cellH = 22;
  const h = tables.length * cellH + 60;

  return (
    <Section
      id="XIII-coverage" num={13}
      kicker="Coverage"
      title="Coverage Matrix"
      lede="Nine fact tables, forty-nine school years on the calendar, an inconsistent grid in practice. The matrix below is the panel's footprint: filled cells where data is present, empty cells where the federal collection has not been published or is not yet ingested."
    >
      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', minWidth: 720, height: 'auto', display: 'block' }}>
          {/* X-axis year labels */}
          {years.map((y, j) => {
            const x = labelW + j * cellW + cellW / 2;
            return (
              <text key={y} x={x} y={28}
                    transform={`rotate(-60 ${x} 28)`}
                    style={{ ...AXIS_STYLE, fontFamily: MONO, fontSize: 9 }} fill={TEXT_3}
                    textAnchor="end">
                {y}
              </text>
            );
          })}

          {/* Cells */}
          {tables.map((tbl, i) => {
            const y = 60 + i * cellH;
            const cells = coverage[tbl];
            return (
              <g key={tbl}>
                <text x={labelW - 8} y={y + cellH * 0.65}
                      style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11 }} fill={INK} textAnchor="end">
                  {FACT_TABLE_LABEL[tbl] || tbl}
                </text>
                {years.map((yr, j) => {
                  const present = cells[yr];
                  const x = labelW + j * cellW;
                  return (
                    <rect
                      key={yr}
                      x={x + 1} y={y + 2}
                      width={cellW - 2} height={cellH - 4}
                      fill={present ? ACCENT_2 : PAPER_3}
                      opacity={present ? 0.85 : 0.45}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(${labelW}, ${tables.length * cellH + 70})`}>
            <rect x={0} y={0} width={12} height={12} fill={ACCENT_2} opacity={0.85} />
            <text x={18} y={10} style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11 }} fill={INK}>
              data present
            </text>
            <rect x={120} y={0} width={12} height={12} fill={PAPER_3} opacity={0.45} />
            <text x={138} y={10} style={{ ...AXIS_STYLE, fontFamily: SERIF, fontSize: 11 }} fill={INK}>
              not in panel
            </text>
          </g>
        </svg>
      </div>
      <Caption
        n={16}
        title="Panel coverage by fact table and school year"
        source="Source — built from row counts in each fact table. A cell is filled if at least one row exists for that (table, year) pair. Years span 1976–77 through 2024–25; not every table starts at 1976."
      >
        Three coverage horizons are visible. The national series (top row) reaches back to 1976–77.
        State-level breakdowns by disability and race begin at 2005–06 with the OMB 1997 race
        revision. Environment, sex, and LEP cross-tabulations begin at 2012–13 and run to current.
        The NCES enrollment denominator (bottom row) is more limited and is the binding constraint
        on multi-year rate computation.
      </Caption>
    </Section>
  );
}

// =====================================================================
// SECTION XIV — COLOPHON & SOURCES
// =====================================================================

function SectionXIV() {
  return (
    <Section
      id="XIV-colophon" num={14}
      kicker="Colophon"
      title="Colophon &amp; Sources"
      lede="A note on construction. Every figure in this monograph is reproducible from a single SQLite database, idea_panel.sqlite, distributed as idea_db.tar.gz. The build is deterministic and content-addressed."
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32,
        marginTop: 16,
      }}>
        <div>
          <SmallCaps style={{ fontSize: 11, color: ACCENT, display: 'block', marginBottom: 8 }}>
            Primary sources
          </SmallCaps>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.65, color: INK }}>
            <li style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 8, paddingBottom: 8 }}>
              <strong>OSEP IDEA Section&nbsp;618</strong> — child-count data files,
              U.S. Department of Education, Office of Special Education Programs.
              <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: TEXT_3, marginTop: 2 }}>
                fact_state_disability · fact_state_disability_environment · fact_state_disability_race · fact_state_disability_sex · fact_state_disability_lep · fact_state_disability_age_single
              </span>
            </li>
            <li style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 8, paddingBottom: 8 }}>
              <strong>NCES Digest 2023, Table 204.30</strong> — children served under IDEA, by disability, U.S. totals.
              <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: TEXT_3, marginTop: 2 }}>
                fact_national (numerator series, ages 3–21)
              </span>
            </li>
            <li style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 8, paddingBottom: 8 }}>
              <strong>NCES Digest 2023, Table 204.70</strong> — IDEA-served students as percentage of total enrollment, by state.
              <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: TEXT_3, marginTop: 2 }}>
                fact_state_total (state-level rate cross-check)
              </span>
            </li>
            <li style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 8, paddingBottom: 8 }}>
              <strong>NCES Digest 2023, Table 203.20</strong> — public-school enrollment by state.
              <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: TEXT_3, marginTop: 2 }}>
                fact_state_enrollment (denominator for state-level rate)
              </span>
            </li>
          </ul>
        </div>

        <div>
          <SmallCaps style={{ fontSize: 11, color: ACCENT, display: 'block', marginBottom: 8 }}>
            Method
          </SmallCaps>
          <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.65, color: INK, marginTop: 0 }}>
            All percentages of public-school enrollment use the NCES Digest 203.20 denominator.
            For Wisconsin SY 2022–23 the round-trip computation
            (125,334 ÷ 823,040 = 15.226%) reproduces the published Table 204.70 figure exactly,
            confirming the denominator alignment.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.65, color: INK }}>
            State-level cross-tabulations (race, sex, LEP, environment, age) cover 50 states + the
            District of Columbia. Outlying areas, the Bureau of Indian Education, and the Freely
            Associated States are excluded from those breakdowns and from the U.S. national row
            shown in this monograph.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.65, color: INK }}>
            Computed rates are flagged in <code style={{ fontFamily: MONO, fontSize: 12 }}>meta_dataquality</code>
            with source class <code style={{ fontFamily: MONO, fontSize: 12 }}>CROSSCHECK</code>;
            anomaly-inferred caveats with class <code style={{ fontFamily: MONO, fontSize: 12 }}>INFERRED_FROM_ANOMALY</code>.
            See &sect;&nbsp;XII.
          </p>
        </div>
      </div>

      <div style={{
        marginTop: 36, paddingTop: 24, borderTop: `2px solid ${INK}`,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24,
      }}>
        <div>
          <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>Build determinism</SmallCaps>
          <p style={{ fontFamily: MONO, fontSize: 11, color: TEXT_2, marginTop: 6, lineHeight: 1.55 }}>
            Master content hash<br/>
            <span style={{ color: INK }}>7a32f2ac …91fc88</span>
          </p>
        </div>
        <div>
          <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>Regression</SmallCaps>
          <p style={{ fontFamily: MONO, fontSize: 11, color: TEXT_2, marginTop: 6, lineHeight: 1.55 }}>
            Test suite<br/>
            <span style={{ color: INK }}>18 / 18 passing</span>
          </p>
        </div>
        <div>
          <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>Database</SmallCaps>
          <p style={{ fontFamily: MONO, fontSize: 11, color: TEXT_2, marginTop: 6, lineHeight: 1.55 }}>
            SQLite<br/>
            <span style={{ color: INK }}>idea_panel.sqlite</span>
          </p>
        </div>
        <div>
          <SmallCaps style={{ fontSize: 10, color: TEXT_3 }}>Distribution</SmallCaps>
          <p style={{ fontFamily: MONO, fontSize: 11, color: TEXT_2, marginTop: 6, lineHeight: 1.55 }}>
            Tarball<br/>
            <span style={{ color: INK }}>idea_db.tar.gz</span>
          </p>
        </div>
      </div>

      <div style={{
        marginTop: 36, paddingTop: 16, borderTop: `1px solid ${RULE}`,
        textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic',
        fontSize: 13, color: TEXT_3, lineHeight: 1.6,
      }}>
        End of the panel. Set in Iowan Old Style; figures rendered in SVG and Recharts.
        Compiled from idea_panel.sqlite — a 568,000-row analytical view of U.S. special-education
        reporting, 1976&ndash;77 through 2024&ndash;25.
      </div>
    </Section>
  );
}


// =====================================================================
// REFERENCES & FURTHER READING
// =====================================================================

const REFS = [
  {
    category: 'Primary data sources',
    blurb: 'The federal collections from which idea_db is built.',
    items: [
      {
        authors: 'National Center for Education Statistics',
        year: 'annual',
        title: 'Digest of Education Statistics',
        venue: 'Institute of Education Sciences, U.S. DoE',
        url: 'https://nces.ed.gov/programs/digest/',
        note: 'Source of Tables 204.30 (national series), 204.70 (state rates), and 203.20 (denominators). All §IV–§VI rates trace here.',
      },
      {
        authors: 'U.S. Department of Education, Office for Civil Rights',
        year: 'biennial',
        title: 'Civil Rights Data Collection (CRDC)',
        venue: 'U.S. DoE',
        url: 'https://ocrdata.ed.gov/',
        note: 'Adjacent collection — district- and school-level disability data, useful for cross-checks of §VIII race breakdowns.',
      },
    ],
  },
  {
    category: 'Foundational reviews',
    items: [
      {
        authors: 'National Research Council',
        year: 2002,
        title: 'Minority Students in Special and Gifted Education',
        venue: 'National Academies Press',
        url: 'https://doi.org/10.17226/10128',
        note: 'Standard reference for the disproportionality literature. Sets the analytic framework behind §VIII risk-ratio readings.',
      },
    ],
  },
  {
    category: 'Disproportionality (race, sex, EL)',
    items: [
      {
        authors: 'Skiba, R.J., Simmons, A.B., Ritter, S., Gibb, A.C., Rausch, M.K., Cuadrado, J., & Chung, C-G.',
        year: 2008,
        title: 'Achieving equity in special education: History, status, and current challenges',
        venue: 'Exceptional Children, 74(3), 264–288',
        url: 'https://doi.org/10.1177/001440290807400301',
        note: 'Standard framing of Black over-representation in IDEA categories. Direct context for §VIII.',
      },
      {
        authors: 'Morgan, P.L., Farkas, G., Hillemeier, M.M., Mattison, R., Maczuga, S., Li, H., & Cook, M.',
        year: 2015,
        title: 'Minorities are disproportionately underrepresented in special education: Longitudinal evidence across five disability conditions',
        venue: 'Educational Researcher, 44(5), 278–292',
        url: 'https://doi.org/10.3102/0013189X15591157',
        note: 'Counter-finding: after controlling for academic achievement and SES, racial minorities are *under*-identified. Pair with Skiba et al. for §VIII.',
      },
      {
        authors: 'Sullivan, A.L.',
        year: 2011,
        title: 'Disproportionality in special education identification and placement of English language learners',
        venue: 'Exceptional Children, 77(3), 317–334',
        url: 'https://doi.org/10.1177/001440291107700304',
        note: 'Foundational quantitative work on EL × disability intersection. Direct context for §IX.',
      },
    ],
  },
  {
    category: 'Specific learning disability and RTI',
    items: [
      {
        authors: 'Fletcher, J.M., Lyon, G.R., Fuchs, L.S., & Barnes, M.A.',
        year: 2018,
        title: 'Learning Disabilities: From Identification to Intervention (2nd ed.)',
        venue: 'Guilford Press',
        url: null,
        note: 'Authoritative on SLD identification methodology — discrepancy model vs. RTI. Background for the SLD share decline visible in §III.',
      },
      {
        authors: 'Reschly, D.J., & Hosp, J.L.',
        year: 2004,
        title: 'State SLD identification policies and practices',
        venue: 'Learning Disability Quarterly, 27(4), 197–213',
        url: 'https://doi.org/10.2307/1593673',
        note: 'Documents state-level variation in SLD criteria — a partial driver of cross-state differences in §IV.',
      },
    ],
  },
  {
    category: 'Autism prevalence',
    items: [
      {
        authors: 'Maenner, M.J., et al.',
        year: 2023,
        title: 'Prevalence and Characteristics of Autism Spectrum Disorder Among Children Aged 8 Years',
        venue: 'MMWR Surveillance Summaries, 72(2)',
        url: 'https://doi.org/10.15585/mmwr.ss7202a1',
        note: 'CDC ADDM Network — clinical-prevalence baseline. Compares against the IDEA-served AUT count in §III/§VII.',
      },
      {
        authors: 'Loomes, R., Hull, L., & Mandy, W.P.L.',
        year: 2017,
        title: 'What is the male-to-female ratio in autism spectrum disorder? A systematic review and meta-analysis',
        venue: 'JAACAP, 56(6), 466–474',
        url: 'https://doi.org/10.1016/j.jaac.2017.03.013',
        note: 'Meta-analytic 4.2:1 male-to-female ratio in clinical populations — IDEA panel reads 4.4× (§VII). Strong agreement.',
      },
    ],
  },
  {
    category: 'Emotional and behavioral disorders',
    items: [
      {
        authors: 'Kauffman, J.M., & Landrum, T.J.',
        year: 2018,
        title: 'Characteristics of Emotional and Behavioral Disorders of Children and Youth (11th ed.)',
        venue: 'Pearson',
        url: null,
        note: 'Standard textbook. The under-identification gap (clinical prevalence ≈ 6%, IDEA-served < 1%) is its central concern.',
      },
      {
        authors: 'Forness, S.R., Kim, J., & Walker, H.M.',
        year: 2012,
        title: 'Special education implications of point and cumulative prevalence for children with emotional or behavioral disorders',
        venue: 'JEBD, 20(1), 4–18',
        url: 'https://doi.org/10.1177/1063426611401624',
        note: 'Quantifies the EBD identification gap. Background for the flat-low ED trajectory in §III.',
      },
    ],
  },
  {
    category: 'Least restrictive environment',
    items: [
      {
        authors: 'McLeskey, J., Landers, E., Williamson, P., & Hoppey, D.',
        year: 2012,
        title: 'Are we moving toward educating students with disabilities in less restrictive settings?',
        venue: 'Journal of Special Education, 46(3), 131–140',
        url: 'https://doi.org/10.1177/0022466910376670',
        note: 'Direct precursor to §X. Documents the inclusion trend through 2010; idea_db extends this to 2024–25.',
      },
    ],
  },
  {
    category: 'On Section 618 data quality',
    items: [
      {
        authors: 'Aron, L., & Loprest, P.',
        year: 2012,
        title: 'Disability and the education system',
        venue: 'The Future of Children, 22(1), 97–122',
        url: 'https://doi.org/10.1353/foc.2012.0007',
        note: 'Critique of state-level reporting variation. Provides framing for the across-state spread in §IV.',
      },
    ],
  },
];

function References() {
  return (
    <Section
      id="XV-references" num={15}
      kicker="Further reading"
      title="References &amp; Further Reading"
      lede="A reading list to triangulate this panel against the broader special-education literature. The monograph itself is not a research contribution — it is a reproducible aggregation. The works below provide context, methodology, and contesting interpretations. References are illustrative starting points; verify against original publications before citing."
    >
      {REFS.map((cat, i) => (
        <div key={cat.category} style={{ marginTop: i === 0 ? 16 : 36 }}>
          <SmallCaps style={{ fontSize: 11, color: ACCENT, display: 'block', marginBottom: 8 }}>
            {cat.category}
          </SmallCaps>
          {cat.blurb && (
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: TEXT_2, margin: '0 0 12px 0' }}>
              {cat.blurb}
            </p>
          )}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cat.items.map((item, j) => (
              <li key={j} style={{
                borderTop: `1px solid ${RULE_SOFT}`,
                paddingTop: 12, paddingBottom: 12,
              }}>
                <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.55 }}>
                  <span style={{ color: TEXT_2 }}>{item.authors}</span>
                  {' '}
                  <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT_3 }}>({item.year})</span>
                  {'. '}
                  <em style={{ color: INK }}>{item.title}</em>
                  {'. '}
                  <span style={{ color: TEXT_2, fontStyle: 'italic' }}>{item.venue}</span>
                  {item.url && (
                    <>
                      {'  '}
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: ACCENT, textDecoration: 'none', fontFamily: MONO, fontSize: 11 }}>
                        ↗
                      </a>
                    </>
                  )}
                </div>
                {item.note && (
                  <p style={{
                    fontFamily: SERIF, fontStyle: 'italic',
                    fontSize: 12.5, color: TEXT_2, lineHeight: 1.55,
                    margin: '6px 0 0 0', paddingLeft: 14,
                    borderLeft: `1px solid ${RULE}`,
                  }}>
                    {item.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </Section>
  );
}

// =====================================================================
// SITE FOOTER
// =====================================================================

function SiteFooter() {
  return (
    <footer style={{
      marginTop: 48, paddingTop: 24, paddingBottom: 24,
      borderTop: `2px solid ${INK}`,
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 24,
      fontFamily: SERIF, fontSize: 13, color: TEXT_2, lineHeight: 1.55,
    }}>
      <div>
        <SmallCaps style={{ fontSize: 10, color: TEXT_3, display: 'block', marginBottom: 6 }}>
          Project
        </SmallCaps>
        <strong style={{ color: INK }}>idea_db</strong>
        <div style={{ fontStyle: 'italic', marginTop: 4 }}>
          A SQLite panel of U.S. IDEA Section&nbsp;618 reporting, 1976&ndash;77 through 2024&ndash;25.
        </div>
      </div>
      <div>
        <SmallCaps style={{ fontSize: 10, color: TEXT_3, display: 'block', marginBottom: 6 }}>
          Source &amp; data
        </SmallCaps>
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer"
          style={{ color: ACCENT, textDecoration: 'none' }}>
          View on GitHub ↗
        </a>
        <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 11, color: TEXT_3 }}>
          idea_db.tar.gz · 7a32f2ac…91fc88
        </div>
      </div>
      <div>
        <SmallCaps style={{ fontSize: 10, color: TEXT_3, display: 'block', marginBottom: 6 }}>
          Citation
        </SmallCaps>
        <div style={{ fontSize: 12 }}>
          Cite as: <em>idea_db: A statistical panel for IDEA Section&nbsp;618</em>,
          Edition May 2026.
        </div>
      </div>
      <div>
        <SmallCaps style={{ fontSize: 10, color: TEXT_3, display: 'block', marginBottom: 6 }}>
          License
        </SmallCaps>
        <div style={{ fontSize: 12 }}>
          Code: MIT.<br />
          Data: derived from public U.S. federal sources (NCES, OSEP); see Colophon.
        </div>
      </div>
    </footer>
  );
}

// =====================================================================
// TAB NAVIGATION
// =====================================================================

const TABS = [
  { id: 'overview',          num: '·',    label: 'Overview' },
  { id: 'I-trajectory',      num: 'I',    label: 'The Curve' },
  { id: 'II-composition',    num: 'II',   label: 'Composition' },
  { id: 'III-categories',    num: 'III',  label: 'Categories' },
  { id: 'IV-geography',      num: 'IV',   label: 'Geography' },
  { id: 'V-state-detail',    num: 'V',    label: 'State Read' },
  { id: 'VI-trajectories',   num: 'VI',   label: 'Trajectories' },
  { id: 'VII-sex',           num: 'VII',  label: 'Sex' },
  { id: 'VIII-race',         num: 'VIII', label: 'Race' },
  { id: 'IX-el',             num: 'IX',   label: 'EL' },
  { id: 'X-environment',     num: 'X',    label: 'Environment' },
  { id: 'XI-age',            num: 'XI',   label: 'Age' },
  { id: 'XII-dq',            num: 'XII',  label: 'Data Quality' },
  { id: 'XIII-coverage',     num: 'XIII', label: 'Coverage' },
  { id: 'XIV-colophon',      num: 'XIV',  label: 'Colophon' },
  { id: 'XV-references',     num: 'XV',   label: 'References' },
];

function TabBar({ active, onSelect }) {
  return (
    <nav style={{
      borderTop: `1px solid ${RULE}`,
      borderBottom: `1px solid ${RULE}`,
      marginTop: 16,
      marginBottom: 8,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      position: 'sticky',
      top: 0,
      background: PAPER,
      zIndex: 10,
    }}>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', gap: 0,
        whiteSpace: 'nowrap',
      }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <li key={tab.id}>
              <button
                onClick={() => onSelect(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${INK}` : '2px solid transparent',
                  cursor: 'pointer',
                  padding: '12px 14px',
                  fontFamily: SERIF,
                  fontSize: 13,
                  color: isActive ? INK : TEXT_3,
                  fontWeight: 400,
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = INK; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = TEXT_3; }}
              >
                <span style={{
                  fontFamily: MONO, fontSize: 10,
                  color: isActive ? ACCENT : TEXT_4,
                  letterSpacing: '0.06em',
                }}>
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Overview() {
  return (
    <React.Fragment>
      <Frontispiece />
      <AtAGlance />
    </React.Fragment>
  );
}

function ActiveSection({ active }) {
  switch (active) {
    case 'overview':         return <Overview />;
    case 'I-trajectory':     return <SectionI />;
    case 'II-composition':   return <SectionII />;
    case 'III-categories':   return <SectionIII />;
    case 'IV-geography':     return <SectionIV />;
    case 'V-state-detail':   return <SectionV />;
    case 'VI-trajectories':  return <SectionVI />;
    case 'VII-sex':          return <SectionVII />;
    case 'VIII-race':        return <SectionVIII />;
    case 'IX-el':            return <SectionIX />;
    case 'X-environment':    return <SectionX />;
    case 'XI-age':           return <SectionXI />;
    case 'XII-dq':           return <SectionXII />;
    case 'XIII-coverage':    return <SectionXIII />;
    case 'XIV-colophon':     return <SectionXIV />;
    case 'XV-references':    return <References />;
    default:                 return <Overview />;
  }
}

// =====================================================================
// TOP-LEVEL DASHBOARD COMPONENT
// =====================================================================

export default function Dashboard() {
  const [active, setActive] = useState('overview');

  // Scroll to top of main content area when tab changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  return (
    <div
      style={{
        background: PAPER,
        color: INK,
        fontFamily: SERIF,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div
        className="px-4 sm:px-8 lg:px-16"
        style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 72 }}
      >
        <Masthead />
        <TabBar active={active} onSelect={setActive} />
        <ActiveSection active={active} />
        <SiteFooter />
      </div>
    </div>
  );
}
