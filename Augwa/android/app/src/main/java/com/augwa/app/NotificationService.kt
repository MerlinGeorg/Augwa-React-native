
package com.augwa.app 

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

object NotificationService {
    const val CHANNEL_ID = "geofencing-channel"

    fun createChannels(application: Application) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Geofencing Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for geofence events"
                enableVibration(true)
            }
            
            val notificationManager = application.getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }
}