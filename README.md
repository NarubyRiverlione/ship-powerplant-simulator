# Ship engine power plant
simulation of a ship engine power plant


| Statements                  | Branches                | Functions                 | Lines                |
| --------------------------- | ----------------------- | ------------------------- | -------------------- |
| ![Statements](https://img.shields.io/badge/Coverage-99.54%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-99.63%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-99.28%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-99.52%25-brightgreen.svg)    |

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
(intake) DsStorage 
             |
           (outlet) |--> Handpump (todo) --> bypass valve --> |
                    |                                         |=>=(MultiToOne)->- (intake) DsService (outlet)                                   
                    |->- (intake) Purification          -->-- |
                                    |
                                  (steam intake)
```

### (WIP) Heavy Fuel

#### Storage
```
                  |->-(intake) Fore Bunker (outlet)       -->-- |       |-->--(intake) Setteling tank (outlet)
                  |                |-<- (steam intake)          |       |                |-<- (steam intake)  
                  |                                             |    outlet valve 
 Shore Valve -->--|->-(intake) Port Bunker (outlet)       -->-- |       |
                   |               |-<- (steam intake)          |==>== Pump 
                  |                                             |       (main bus)
                  |->-(intake) Aft Bunker (outlet)        -->-- | 
                  |                |-<- (steam intake)          |
                  |                                             |
                  |->-(intake) Starboard Bunker (outlet)  -->-- |
                  |                |-<- (steam intake)          |
```

#### (todo) Service
```
(intake) Setteling tank (outlet) -->-- Purification -->-- (intake) Service tank (outlet)
            |-<- (steam intake)           |-<- (steam intake)               |-<- (steam intake)  
```

## Lubrication system
```
Shore Valve --->-- (intake valve) DsStorage (outlet valve)
                                  (drain)                            
```
(todo: purifier)


## Compressed Air system

### Start Air
```
Start air compressor 1 ->- outlet valve  -->-- FW air compress cooler -->-- (intake) Start air receiver 1 (outlet)
             | safety                                                                            | (drain)


Emergency compressor ->- outlet valve  -->-- (intake) Emergence receiver (outlet)
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
(Feed water Make up) ->- (Inlet Valve) Feed Water Supply Tank (outlet) ->- Feed Water Pump  ->- (intake) BOILER
                                        |       (drain)
            ==>== Steam Condensor  ==>==|
```

### Steam diagram
```
       |--> Safety Release valve 
BOILER |
       |--> Steam Vent valve
       |
       |
       |==>== Main Steam valve ==>==  
```

## (Todo) Main Engine
