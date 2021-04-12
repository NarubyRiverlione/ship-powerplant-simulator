# Ship engine power plant
simulation of a ship engine power plant


| Statements                  | Branches                | Functions                 | Lines                |
| --------------------------- | ----------------------- | ------------------------- | -------------------- |
| ![Statements](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-99.37%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)    |

## Power systems
### Switchboard
```
Diesel generator 1 -->  Breaker Diesel Gen 1
                                  |               ShoreBreaker --<-- Shore
                                  |                |                          |-<--- Emergency generator
==== PROVIDERS  ===============================================================
                        |                     | (switch)
                   MainBreaker1               |
                        |                   Emergency Bus
                        |
                    MainBus1
                        |
```

### Diesel generator
```
-- (Diesel service tank) ----------->-- Diesel oil intake valve =======>== |------------------| 
                                                                           |                  |
-- (Emergency start air receiver) -->-- Start air intake valve  =======>== | Diesel generator |===>=== (Breaker Diesel generator)
                                                                           |                  |
-- (Lubrication service tank) -->-- Lubrication intake valve =>= Slump =>= |------------------| 
                                                                    |                        |     
                                                                    |==<== Lub. cooler ==<== |
                                                                            |       |
                                                                        (Fresh water cooler)
```


## Fuel system

### Diesel oil
```
Shore Valve 
    |
(intake valve) DsStorage 
                |
               (outlet valve) |--> Handpump (todo) --> bypass valve --> |
                              |                                         |=>(MultiToOne)--> (intake valve) DsService (outlet valve)                                   
                              |-->-- Purification (WIP)           -->-- |
```

### Todo Heavy Fuel


## Lubrication system
```
Shore Valve --->-- (intake valve) DsStorage (outlet valve)
                                  (drain)                            
```
(todo: purifier)


## Compressed Air system

### Start Air
```
Start air compressor 1 ->- outlet valve  -->-- FW air compress cooler -->-- (intake valve) Start air receiver 1 (outlet valve)
             | safety                                                                            | (drain)


Emergency compressor ->- outlet valve  -->-- (intake valve) Emergence receiver (outlet valve)
       | safety   
```

### (Todo) Service Air


## Cooling systems

### Sea water cooling circuit 
```
Sea chest high  - suction Valve ->- |  
                                    | - Suction pump 1 (main bus) --|     |- Steam condensor                         -->-|
                                    | - Suction pump 2 (main bus) --|==>==|- Fresh water cooler Start Air compressor  ->-|==>== over board dump valve
                                    | - Aux pump (emergency bus)  --|     |- Fresh water cooler Diesel generator      ->-|
Sea chest low  - suction valve ->-  |                                             (aux capable)
*/
```

### Fresh water cooling circuits
```
                                  Fresh water Expand tank
                                      |         |
  |->- Start Air compressor  cooler->-|         |->- Diesel generator Lubrication cooler -<-|
  |                                   |         |                                           |
Pump FW Air cooler (Main bus)         |        Pump Diesel generator cooler (Emergency Bus) |
  |                                   |         |                                           |
  |-<- Fresh water Start Air cooler-<-|         |-<- Fresh water Diesel generator cooler -<-|
              ||                                            ||
              Sea water cooling Systems                     Sea water cooling system       

```


## Steam system

### Fuel
```
  BOILER  -<- Fuel Intake Valve  ==<== Fuel Pump   
                                          |
                                          | ==<== Fuel intake valve
                                                   |
                                                   |==<== (fuelSourceValve = Diesel Service Outlet Valve)  
```

### Water diagram
```
 BOILER   -<- Water Intake Valve ==<== Feed Water Pump 
                                        |==<== Feed Water Supply Outlet Valve 
                                        |
                                        |-<- Feed Water Supply Tank 
                                              |             |-<- Feed Water Inlet Valve -<- (Feed water Make up)
                                        Drain valve                             
```

### Steam diagram
```
       |--> Safety Release valve 
BOILER |
       |--> Steam Vent valve
       |
       |
       |==>== Main Steam valve ==>==
       |
       |==<== Steam Condensor ==<==
```

## (Todo) Main Engine
