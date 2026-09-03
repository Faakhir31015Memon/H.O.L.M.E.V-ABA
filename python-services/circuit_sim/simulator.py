from typing import List, Dict, Any

class CircuitSimulator:
    def simulate(self, components: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> Dict[str, Any]:
        warnings = []
        errors = []
        component_states = {}

        if not components:
            return {
                "success": False,
                "isClosedCircuit": False,
                "totalResistance": 0.0,
                "currentAmps": 0.0,
                "voltageDrop": 0.0,
                "warnings": ["No components in circuit."],
                "errors": [],
                "componentStates": {}
            }

        # Find power sources (Batteries)
        batteries = [c for c in components if c.get("type") == "battery"]
        if not batteries:
            errors.append("No power source (Battery) found in circuit.")

        # Find switches and verify if open
        switches = [c for c in components if c.get("type") == "switch"]
        open_switches = [s for s in switches if not s.get("properties", {}).get("state", False)]
        if open_switches:
            warnings.append(f"{len(open_switches)} switch(es) are OPEN. Circuit loop incomplete.")

        total_voltage = sum([b.get("properties", {}).get("voltage", 9.0) for b in batteries]) if batteries else 0.0
        
        # Calculate total resistance of series elements
        resistors = [c for c in components if c.get("type") == "resistor"]
        total_resistance = sum([r.get("properties", {}).get("resistance", 220.0) for r in resistors])

        # LEDs
        leds = [c for c in components if c.get("type") == "led"]

        # Default minimal wire resistance if 0
        if total_resistance < 0.1 and leds and total_voltage > 0:
            errors.append("CRITICAL: Direct short circuit detected! LED connected without current-limiting resistor.")

        current_amps = total_voltage / max(total_resistance, 0.1) if total_voltage > 0 else 0.0

        # Validate LED safety
        for led in leds:
            forward_v = led.get("properties", {}).get("forwardVoltage", 2.0)
            max_i = led.get("properties", {}).get("maxCurrent", 0.03) # 30mA
            
            if total_voltage < forward_v:
                warnings.append(f"LED '{led.get('name')}' voltage ({total_voltage}V) below forward threshold ({forward_v}V).")
                component_states[led.get("id")] = {"active": False, "voltage": total_voltage, "current": 0.0}
            elif current_amps > max_i:
                errors.append(f"LED '{led.get('name')}' OVERLOAD! Current ({round(current_amps*1000, 1)}mA) exceeds max ({round(max_i*1000, 1)}mA). LED burned out.")
                component_states[led.get("id")] = {"active": False, "voltage": total_voltage, "current": current_amps, "overloaded": True}
            else:
                component_states[led.get("id")] = {"active": True, "voltage": forward_v, "current": current_amps}

        is_closed = len(errors) == 0 and len(connections) >= max(len(components) - 1, 1)

        return {
            "success": True,
            "isClosedCircuit": is_closed,
            "totalResistance": round(total_resistance, 2),
            "currentAmps": round(current_amps, 4),
            "voltageDrop": round(total_voltage, 2),
            "warnings": warnings,
            "errors": errors,
            "componentStates": component_states
        }
