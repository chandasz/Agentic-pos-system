import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, action = "clock_in" } = body as {
      pin: string;
      action?: "clock_in" | "clock_out" | "check_status";
    };

    if (!pin || pin.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "PIN code is required" },
        { status: 400 }
      );
    }

    // 1. Locate employee by PIN
    const employee = await prisma.employee.findFirst({
      where: { pin_code: pin.trim() },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Invalid 4-digit PIN. Staff member not found." },
        { status: 404 }
      );
    }

    // 2. Check for currently active (unclosed) attendance session
    const openAttendance = await prisma.attendance.findFirst({
      where: {
        employee_id: employee.id,
        clock_out: null,
      },
      orderBy: { clock_in: "desc" },
    });

    if (action === "check_status") {
      return NextResponse.json({
        success: true,
        employee,
        isClockedIn: !!openAttendance,
        attendance: openAttendance,
      });
    }

    if (action === "clock_in") {
      if (openAttendance) {
        return NextResponse.json(
          {
            success: false,
            error: `${employee.name} is already clocked in since ${new Date(
              openAttendance.clock_in
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
            employee,
            attendance: openAttendance,
          },
          { status: 400 }
        );
      }

      const newAttendance = await prisma.attendance.create({
        data: {
          employee_id: employee.id,
          clock_in: new Date(),
          status: "PRESENT",
        },
      });

      return NextResponse.json({
        success: true,
        message: `${employee.name} clocked in successfully at ${new Date(
          newAttendance.clock_in
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        employee,
        attendance: newAttendance,
        action: "clock_in",
      });
    }

    if (action === "clock_out") {
      if (!openAttendance) {
        return NextResponse.json(
          {
            success: false,
            error: `No active clock-in session found for ${employee.name}. Please clock in first.`,
            employee,
          },
          { status: 400 }
        );
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id: openAttendance.id },
        data: {
          clock_out: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${employee.name} clocked out successfully at ${new Date(
          updatedAttendance.clock_out!
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        employee,
        attendance: updatedAttendance,
        action: "clock_out",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action specified." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Attendance API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process attendance record" },
      { status: 500 }
    );
  }
}
